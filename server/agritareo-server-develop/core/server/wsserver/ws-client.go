package wsserver

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"ns-api/core/services/mongodb"
	"ns-api/core/services/mssql"
	"ns-api/core/sts"
	"ns-api/modules/log"
)

const (
	AuthenticateClientCode int = 0
	TransactionClientCode  int = 1
	NotifyClientCode       int = 2
)

//type WsClient interface {
//	Close()
//	ListenRead()
//	ListenWrite()
//	Send(int, interface{})
//	Broadcast(int, interface{}, ...bool)
//	GetCorporationId() string
//	GetUserId() int64
//	GetCompanyId() string
//}

type wsPayload struct {
	OpCode        int         `json:"opcode"`
	Data          interface{} `json:"data"`
	TransactionId string      `json:"transaction_id"`
}

type wsMessage struct {
	Opcode        int         `json:"opcode"`
	Data          interface{} `json:"data"`
	TransactionId string      `json:"transaction_id,omitempty"`
	id            string
	ignore        bool
}

type WsClient struct {
	sts.Client

	Id       string
	socket   *websocket.Conn
	server   *wsServer
	response chan *wsMessage
}

func (c *WsClient) Send(opcode int, data interface{}) {
	c.response <- &wsMessage{
		Opcode: opcode,
		Data:   data,
		id:     c.Id,
	}
}

func (c *WsClient) Broadcast(opcode int, data interface{}, ignore ...bool) {
	var ignoreCurrentClient bool

	if len(ignore) > 0 {
		ignoreCurrentClient = ignore[0]
	}

	c.server.broadcast <- &wsMessage{
		Opcode: opcode,
		Data:   data,
		id:     c.Id,
		ignore: ignoreCurrentClient,
	}
}

func (c *WsClient) GetUserId() int64 {
	return c.UserId
}

func (c *WsClient) GetCompanyId() string {
	return c.CompanyId
}

func (c *WsClient) GetCorporationId() string {
	return c.CorporationId
}

func (c *WsClient) Close() {
	if err := c.socket.Close(); nil != err {
		log.Errorf("Error close ws connection %s", err.Error())
		return
	}
	log.Warnf("Close websocket connection [%s]", c.Id)
}

func (c *WsClient) CloseConnection() {
	c.server.closeConnection <- c
}

func (c *WsClient) ListenRead() {
	defer c.CloseConnection()
	//ws.Socket.SetReadLimit(1024)
	//ws.Socket.SetReadDeadline(time.Now().Add(60 * time.Second))
	for {

		_, msg, err := c.socket.ReadMessage()

		if nil != err {
			break
		}

		var payload *wsPayload

		msg = []byte(fmt.Sprintf(`{"opcode":%v}`, string(msg)))
		err = json.Unmarshal(msg, &payload)

		if nil != err {
			log.Errorf("Error reading ws message %s", err.Error())
		} else {
			data, _ := json.Marshal(payload.Data)

			if AuthenticateClientCode == payload.OpCode {
				if token, ok := payload.Data.(string); ok {
					c.server.authConnection <- []string{c.Id, token}
				}
			} else {
				if !c.HasConnectionId() {
					log.Error("There is no connection for this organization")
					break
				}

				_, err := mssql.DB.ConnectIfNotExists(c.ConnectionId)

				if nil != err {
					log.Error("Could not connect to the database " + err.Error())
					break
				}

				_, err = mongodb.DB.ConnectIfNotExists(c.ConnectionId)

				if nil != err {
					log.Warn("There is no connection to the noSql database server for this organization: " + err.Error())
					break
				}

				c.server.execController <- &wsExec{
					opcode:        payload.OpCode,
					body:          data,
					client:        c,
					isTransaction: 0 < len(payload.TransactionId),
					transactionId: payload.TransactionId,
				}
			}
		}
	}

}

func (c *WsClient) ListenWrite() {
	defer c.CloseConnection()

	for {
		select {
		case msg, ok := <-c.response:
			if !ok {
				_ = c.socket.WriteMessage(websocket.CloseMessage, []byte{})
				break
			}

			data, err := json.Marshal(msg)

			if nil != err {
				log.Error("Error enviando mensaje ws: ", err.Error())
			}

			_ = c.socket.WriteMessage(websocket.TextMessage, data[10:len(data)-1])
		}
	}
}
