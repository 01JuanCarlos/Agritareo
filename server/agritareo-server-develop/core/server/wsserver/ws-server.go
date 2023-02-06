package wsserver

import (
	"encoding/json"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/websocket"
	uuid "github.com/nu7hatch/gouuid"
	"net/http"
	"ns-api/config"
	"ns-api/core/sts"
	"ns-api/modules/log"
	"reflect"
	"sync"
)

//type ServerOpCode uint16

const (
	AuthenticatedServerCode     int = 0
	TransactionServerCode       int = 1
	AuthenticateErrorServerCode int = 2
	NotifyServerCode            int = 3
)

var (
	conf     = config.Conf
	once     sync.Once
	server   *wsServer
	upgrader *websocket.Upgrader
)

type WsServer interface {
	Listen()
	Register(*WsClient)
	Handler(http.ResponseWriter, *http.Request)
	UnRegister(*WsClient)
	AddRoute(int, interface{}, []sts.RouteOptions)
}

type wsHandler struct {
	handler reflect.Value
	options sts.HandlerOptions
}

type wsExec struct {
	body          []byte
	opcode        int
	client        *WsClient
	isTransaction bool
	transactionId string
}

type wsServer struct {
	host string
	port int
	path string

	clients  map[string]*WsClient
	handlers map[int]wsHandler

	openConnection  chan *WsClient
	closeConnection chan *WsClient
	authConnection  chan []string
	execController  chan *wsExec
	broadcast       chan *wsMessage
}

type Options struct {
	Host string
	Port int
}

func New(options Options) WsServer {
	once.Do(func() {

		server = &wsServer{
			host:            options.Host,
			port:            options.Port,
			clients:         make(map[string]*WsClient),
			handlers:        make(map[int]wsHandler),
			openConnection:  make(chan *WsClient),
			closeConnection: make(chan *WsClient),
			authConnection:  make(chan []string),
			execController:  make(chan *wsExec),
			broadcast:       make(chan *wsMessage),
		}

		upgrader = &websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		}
	})
	return server
}

func (s *wsServer) Register(ws *WsClient) {
	s.clients[ws.Id] = ws
	ws.Send(0, json.RawMessage(fmt.Sprintf(`{"sid": "%s"}`, ws.Id)))

	log.Infof("New websocket connection established [%s].", ws.Id)
}

func (s *wsServer) UnRegister(ws *WsClient) {
	if _, ok := s.clients[ws.Id]; ok {
		ws.IsAuth = false
		ws.Close()
		// fixme: close channel, massive CPU usage
		//close(ws.response)
		delete(s.clients, ws.Id)
	}
}

func (s *wsServer) AddRoute(opCode int, handler interface{}, args []sts.RouteOptions) {
	fnProps := reflect.TypeOf(handler)
	handlerOptions := sts.HandlerOptions{
		NumOut:      fnProps.NumOut(),
		NumIn:       fnProps.NumIn(),
		Jwt:         true,
		Privileges:  true,
		IsWebsocket: true,
	}

	if len(args) > 0 {
		routeOptions := args[0]
		if nil != routeOptions.Auth {
			handlerOptions.Jwt = *routeOptions.Auth
		}
	}

	s.handlers[opCode] = wsHandler{
		handler: reflect.ValueOf(handler),
		options: handlerOptions,
	}
}

func (s *wsServer) Handler(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)

	if nil != err {
		http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
		return
	}

	id, _ := uuid.NewV4()

	client := &WsClient{
		Id:       id.String(),
		socket:   ws,
		server:   server,
		response: make(chan *wsMessage),
	}
	//fmt.Printf("Pointer1 %p", server)
	server.openConnection <- client

	go client.ListenRead()
	go client.ListenWrite()
}

func (s *wsServer) Listen() {
	log.Info("Listening and serving Ws on ", fmt.Sprintf(`%s:%d`, s.host, s.port))

	for {
		select {
		case ws, ok := <-s.openConnection:
			if ok {
				s.Register(ws)
			}

		case ws, ok := <-s.closeConnection:
			if ok {
				s.UnRegister(ws)
			}

		case auth, ok := <-s.authConnection:
			if ok && 0 < len(auth) {
				id, token := auth[0], auth[1]
				if ws, ok := s.clients[id]; ok && !ws.IsAuth {
					payload := sts.Client{}

					token, err := jwt.ParseWithClaims(token, &payload, func(token *jwt.Token) (interface{}, error) {
						return config.RSAPublicKey, nil
					})

					if nil != err {
						log.Error("Websocket Authenticate: Malformed authentication token")
						s.UnRegister(ws)
					} else if !token.Valid {
						log.Error("Websocket Authenticate: Token is not valid")
						s.UnRegister(ws)
					} else {
						ws.IsAuth = true
						ws.CompanyId = payload.CompanyId
						ws.CorporationId = payload.CorporationId
						ws.ConnectionId = payload.ConnectionId
						ws.UserId = payload.UserId
						ws.SetConnectionId(payload.CorporationId)
						log.Infof("Authenticated ws connection [%s].", ws.Id)
					}

				}
			}

		case exec, ok := <-s.execController:
			if ok && nil != exec && exec.client.IsAuth {
				if handler, ok := s.handlers[exec.opcode]; ok {
					args := make([]reflect.Value, handler.options.NumIn)
					args[0] = reflect.ValueOf(exec.client)

					if handler.options.NumIn > 1 {
						args[1] = reflect.ValueOf(exec.body)
					}

					if handler.options.NumOut > 0 {
						rs := handler.handler.Call(args[:handler.options.NumIn])
						exec.client.response <- &wsMessage{
							Opcode:        TransactionServerCode,
							Data:          rs[0].Interface(),
							id:            exec.client.Id,
							ignore:        false,
							TransactionId: exec.transactionId,
						}
					} else {
						handler.handler.Call(args[:handler.options.NumIn])
					}
				}
			}

		case message, ok := <-s.broadcast:
			if ok && nil != message {
				for uid, ws := range s.clients {
					if ws.IsAuth {
						if !message.ignore || uid != message.id {
							ws.Send(message.Opcode, message.Data)
						}
					}
				}
			}

		}

	}
}

func Broadcast(opcode int, data interface{}) {
	server.broadcast <- &wsMessage{
		Opcode: opcode,
		Data:   data,
	}
}
