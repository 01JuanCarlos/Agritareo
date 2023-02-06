package httpserver

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/context"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"net/http"
	"ns-api/config"
	"ns-api/core/errors"
	"ns-api/core/middlewares"
	"ns-api/core/server/httpmessage"
	"ns-api/core/services/mongodb"
	"ns-api/core/services/mssql"
	"ns-api/core/sts"
	"ns-api/core/util"
	"ns-api/core/validator"
	"ns-api/locale"
	"ns-api/modules/log"
	urlPath "path"
	"reflect"
	"runtime"
	"strings"
	"sync"
	"time"
)

var (
	conf                    = config.Conf
	once                    sync.Once
	server                  *httpServer
	httpRequestPointerType  = "*Request"
	httpResponseWriterType  = "ResponseWriter"
	clientPointerType       = "*Client"
	requestType             = "HttpRequest"
	requestPointerType      = "*HttpRequest"
	bodyType                = "Body"
	queryType               = "Query"
	paramsType              = "Params"
	headerType              = "Header"
	httpResponseType        = "HttpResponse"
	httpResponsePointerType = "*HttpResponse"
	httpMessageType         = "HttpMessage"
	errorType               = "error"
)

var allowedHandlerParamTypes = []string{
	httpRequestPointerType,
	httpResponseWriterType,
	clientPointerType,
	requestType,
	requestPointerType,
	bodyType,
	queryType,
	paramsType,
	headerType,
}

var getType = func(t reflect.Type) string {
	if t.Kind() == reflect.Ptr {
		return "*" + t.Elem().Name()
	}

	return t.Name()
}

type HttpServer interface {
	Listen()
	GetRouter() *mux.Router
	ExcludeJwtPath(string)
	ExcludeServicesPath(string)
	ExcludePrivilegesPath(string)
	HandleFunc(string, func(http.ResponseWriter, *http.Request))
	AddRoute(string, string, interface{}, []sts.RouteOptions)
}

type httpServer struct {
	router                *mux.Router
	jwtExcludePath        []string
	privilegesExcludePath []string
	skipServicesPath      []string

	host       string
	port       int
	apiVersion string

	exposedHeaders  []string
	allowedHeaders  []string
	allowedOrigins  []string
	allowedMethods  []string
	maxAgePreflight int
}

type Options struct {
	Host            string
	Port            int
	ApiVersion      string
	ExposedHeaders  []string
	AllowedHeaders  []string
	AllowedOrigins  []string
	AllowedMethods  []string
	MaxAgePreflight int
}

func New(options Options) *httpServer {
	once.Do(func() {
		server = &httpServer{
			router:         mux.NewRouter(),
			exposedHeaders: options.ExposedHeaders,
			allowedHeaders: options.AllowedHeaders,
			allowedOrigins: options.AllowedOrigins,
			allowedMethods: options.AllowedMethods,
		}
		server.apiVersion = options.ApiVersion
		server.host = strings.Replace(options.Host, "0.0.0.0", "", 1)
		server.port = options.Port

		server.router.Use(
			middlewares.JwtMiddleware(&server.jwtExcludePath, config.RSAPublicKey),
			middlewares.DbConnectionMiddleware(&server.skipServicesPath),
			//middlewares.PrivilegesMiddleware(),
			func(next http.Handler) http.Handler {
				return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					// Add default content type header
					if len(r.Header.Get(config.TransactionHeader)) > 0 {
						w.Header().Add(config.TransactionHeader, r.Header.Get(config.TransactionHeader))
					}

					next.ServeHTTP(w, r)
				})
			},
		)

	})
	return server
}

func (s *httpServer) HandleFunc(path string, fn func(http.ResponseWriter, *http.Request)) {
	s.router.HandleFunc(path, fn)
}

func (s *httpServer) AddRoute(method string, path string, handler interface{}, options []sts.RouteOptions) {
	handlerOptions := sts.HandlerOptions{
		Jwt:         true,
		Privileges:  true,
		ValidateKey: "id",
		ArgsTypes:   make([]string, 0),
		OutTypes:    make([]string, 0),
	}

	path = urlPath.Join("/", s.apiVersion, path)

	if len(options) > 0 {
		routeOptions := options[0]
		if nil != routeOptions.Auth {
			handlerOptions.Jwt = *routeOptions.Auth
		}

		if nil != routeOptions.Privileges {
			handlerOptions.Privileges = *routeOptions.Privileges
		}

		if nil != routeOptions.Validate {
			handlerOptions.Validate = *routeOptions.Validate
		}

		if nil != routeOptions.SkipServices {
			handlerOptions.SkipServices = *routeOptions.SkipServices
			if handlerOptions.SkipServices {
				handlerOptions.Jwt = false
				handlerOptions.Privileges = false
				handlerOptions.Validate = false
			}
		}

		if "" != routeOptions.ValidateKey && handlerOptions.ValidateKey != routeOptions.ValidateKey {
			handlerOptions.ValidateKey = routeOptions.ValidateKey
		}
	}

	if !handlerOptions.Jwt {
		s.ExcludeJwtPath(path)
	}

	if handlerOptions.SkipServices {
		s.ExcludeServicesPath(path)
	}

	if !handlerOptions.Privileges {
		s.ExcludePrivilegesPath(path)
	}

	fnProps := reflect.TypeOf(handler)
	handlerOptions.NumIn = fnProps.NumIn()
	handlerOptions.NumOut = fnProps.NumOut()
	handlerOptions.ControllerName = runtime.FuncForPC(reflect.ValueOf(handler).Pointer()).Name()

	if handlerOptions.SkipServices {
		log.Warnf(`The services were disabled for (%s), be careful and check before using any connection.`, handlerOptions.ControllerName)
	}

	if handlerOptions.NumIn > 0 {
		for i := 0; i < handlerOptions.NumIn; i++ {
			handlerOptions.ArgsTypes = append(handlerOptions.ArgsTypes, getType(fnProps.In(i)))
		}
	}

	if handlerOptions.NumOut > 0 {
		for i := 0; i < handlerOptions.NumOut; i++ {
			outType := getType(fnProps.Out(i))
			handlerOptions.OutTypes = append(handlerOptions.OutTypes, outType)

			if errorType == outType {
				handlerOptions.ReturnError = true
				handlerOptions.ReturnErrorIndex = i
			}

			// todo: eliminar
			if httpResponseType == outType || httpResponsePointerType == outType {
				handlerOptions.ReturnResult = true
				handlerOptions.ReturnResultIndex = i
			}

			if httpMessageType == outType {
				handlerOptions.ReturnMessage = true
				handlerOptions.ReturnMessageIndex = i
			}
		}
	}

	for i, f := range handlerOptions.ArgsTypes {
		isAllowed := false

		for _, g := range allowedHandlerParamTypes {
			if f == g {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			log.Warnf("The %s handler has been disabled because it has illegal parameters([%d]%s)", handlerOptions.ControllerName, i, f)
			return
		}
	}

	s.router.HandleFunc(path, s.manageHandler(
		reflect.ValueOf(handler),
		handlerOptions,
	)).Methods(method)
}

func (s *httpServer) manageHandler(fn reflect.Value, options sts.HandlerOptions) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var _handlerMessage httpmessage.HttpMessage
		var _handlerError *errors.Error

		_receivedTime := time.Now()

		if _t := context.Get(r, config.ReceivedTimeKey); nil != _t {
			_receivedTime = _t.(time.Time)
		}

		_payload := &sts.Client{}
		_arguments := make([]reflect.Value, 0, options.NumIn)
		_connectionId := context.Get(r, config.PayloadConnectionId)
		_requestBody := util.GetBody(r)

		_request := &sts.HttpRequest{
			IsTransaction: 0 < len(r.Header.Get(config.TransactionHeader)),
			TransactionId: r.Header.Get(config.TransactionHeader),
			ComponentId:   r.Header.Get(config.ComponentIdHeader),
			CorporationId: r.Header.Get(config.CorporationIdHeader),
			ModuleId:      r.Header.Get(config.ModuleIdHeader),
			Body:          util.GetBody(r), // Evitar las referencias.
			Query:         util.FlatMapString(r.URL.Query()),
			Params:        util.MapString(mux.Vars(r)),
			Header:        util.FlatMapString(r.Header),
			Method:        r.Method,
		}

		if _tokePayload := context.Get(r, config.PayloadTokenKey); nil != _tokePayload && options.Jwt {
			_payload = _tokePayload.(*sts.Client)
		}

		// Validate body fields
		if options.Validate && "" != options.ValidateKey {
			id := _request.Query.Get(options.ValidateKey).String()
			//validateKey := fmt.Sprintf(`%v_%v_%v`, _payload.CorporationId, _payload.CompanyId, id)

			if fields := validator.ValidateVars(id, _payload, _requestBody); len(fields) > 0 {
				http.Error(w, "Maintainer validation error", http.StatusBadRequest)
				//_ = json.NewEncoder(w).Encode(ErrorMessage(locale.ValidationError, errors))
				return
			}
		}

		if nil != _connectionId && len(_connectionId.(string)) > 0 {
			sqlConn, err := mssql.DB.GetConnection(_connectionId.(string))

			if nil != err {
				log.Error("It has failed getting the sql connection. ", err.Error())
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			_payload.SetSqlConnection(sqlConn)

			noSqlConn, _ := mongodb.DB.GetConnection(_connectionId.(string))
			_payload.SetNoSqlConnection(noSqlConn)

			if !_payload.HasConnectionId() {
				_payload.SetConnectionId(_connectionId.(string))
			}
		}

		if !_payload.HasSqlConnection() || !_payload.HasNoSqlConnection() {
			// TODO: ...
		}

		if options.NumIn > 0 {
			for _, t := range options.ArgsTypes {
				switch t {
				case httpRequestPointerType:
					_arguments = append(_arguments, reflect.ValueOf(r))
				case httpResponseWriterType:
					_arguments = append(_arguments, reflect.ValueOf(w))
				case clientPointerType:
					if !_payload.IsAuth {
						log.Warnf("%s param is null and you are using in %s", clientPointerType, options.ControllerName)
					}
					_arguments = append(_arguments, reflect.ValueOf(_payload))
				case requestPointerType:
					_arguments = append(_arguments, reflect.ValueOf(_request))
				case requestType:
					_arguments = append(_arguments, reflect.ValueOf(*_request))
				case bodyType:
					_arguments = append(_arguments, reflect.ValueOf(_request.Body))
				case queryType:
					_arguments = append(_arguments, reflect.ValueOf(_request.Query))
				case paramsType:
					_arguments = append(_arguments, reflect.ValueOf(_request.Params))
				case headerType:
					_arguments = append(_arguments, reflect.ValueOf(_request.Header))
				}
			}
		}

		// run controller
		_callResult := fn.Call(_arguments)
		_resolvedTime := time.Now()
		_statusCode := http.StatusNoContent
		_contentType := config.HttpDefaultContentType

		if http.MethodPost == r.Method {
			_statusCode = http.StatusCreated
		}

		// Set message response
		if options.ReturnMessage {
			_callResultMessageInterface := _callResult[options.ReturnResultIndex].Interface()
			if nil != _callResultMessageInterface && nil != _callResultMessageInterface.(httpmessage.HttpMessage) {
				_handlerMessage = _callResultMessageInterface.(httpmessage.HttpMessage)

				_contentType = _handlerMessage.GetContentType()

				if nil != _handlerMessage.GetData() {
					_statusCode = http.StatusOK
				}

				if 0 < _handlerMessage.GetStatusCode() {
					_statusCode = _handlerMessage.GetStatusCode()
				}

				if err := _handlerMessage.GetError(); nil != err {

					_statusCode = http.StatusOK

					if message, ok := locale.Messages[err.Code]; ok && "" == err.Message {
						err.Message = message
					}
				}

			}
		}

		// Set error response
		if options.ReturnError {
			_callResultErrorInterface := _callResult[options.ReturnErrorIndex].Interface()
			if nil != _callResultErrorInterface && nil != _callResultErrorInterface.(error) {
				_handlerError = errors.NewError(_callResultErrorInterface.(error)).(*errors.Error)

				if errors.ErrorTypeInternal == _handlerError.Type {
					http.Error(w, _handlerError.Error(), http.StatusInternalServerError)
					return
				}

				_statusCode = http.StatusOK

				if "" == _handlerError.Message {
					if message, ok := locale.Messages[_handlerError.Code]; ok {
						_handlerError.Message = message
					} else {
						_handlerError.Message = locale.Messages[locale.SomethingBadHappened]
					}
				}

				_handlerMessage = httpmessage.Error(
					_handlerError.Code,
					_handlerError.Error(),
				)

			}
		}

		if options.Jwt && http.MethodGet != r.Method && _request.IsTransaction && !options.SkipServices && nil != _payload {
			_logData := make(map[string]interface{})

			if nil != _requestBody {
				_logData = _requestBody
			}

			// fixme: Puede vernir otro tipo de dato.
			if nil != _handlerMessage && nil != _handlerMessage.GetLog() && "string" != fmt.Sprintf(`%T`, _handlerMessage.GetLog()) {
				for k, v := range _handlerMessage.GetLog().(map[string]interface{}) {
					_logData[k] = v
				}
			}

			//save log
			go func() {
				if db := _payload.NoSql; nil != db {

					var formId string

					if http.MethodPost == r.Method && nil != _handlerMessage && nil != _handlerMessage.GetData() {
						formId = fmt.Sprintf(`%s`, _handlerMessage.GetData())
					} else {
						formId = fmt.Sprintf(`%s`, mux.Vars(r)["id"])
					}

					_, err := db.Save("logs", bson.M{
						"path":           r.URL.Path,
						"urlQuery":       r.URL.Query().Encode(),
						"corporationId":  _payload.CorporationId,
						"companyId":      _payload.CompanyId,
						"userId":         _payload.UserId,
						"username":       _payload.UserName,
						"createdAt":      time.Now(),
						"receivedAt":     _receivedTime,
						"resolvedAt":     _resolvedTime,
						"type":           r.Method,
						"transactionUid": _request.TransactionId,
						"componentId":    _request.ComponentId,
						"data":           _logData,
						"id":             formId,
						"enabled":        true,
					})

					if nil != err {
						log.Errorf("Error saving in change history: %s", err.Error())
					}
				}

			}()

		}

		w.Header().Set("Content-Type", _contentType)

		if _contentType != config.HttpDefaultContentType {
			return
		}

		w.WriteHeader(_statusCode)

		if nil != _handlerMessage && http.StatusNoContent != _statusCode {
			_ = json.NewEncoder(w).Encode(_handlerMessage)
		}
	}
}

func (s *httpServer) GetRouter() *mux.Router {
	return s.router
}

func (s *httpServer) ExcludeJwtPath(path string) {
	s.jwtExcludePath = append(s.jwtExcludePath, path)
}

func (s *httpServer) ExcludeServicesPath(path string) {
	s.skipServicesPath = append(s.skipServicesPath, path)
}

func (s *httpServer) ExcludePrivilegesPath(path string) {
	s.privilegesExcludePath = append(s.privilegesExcludePath, path)
}

func (s *httpServer) Listen() {
	handlerCors := handlers.CORS(
		handlers.ExposedHeaders(s.exposedHeaders),
		handlers.AllowedHeaders(s.allowedHeaders),
		handlers.AllowedOrigins(s.allowedOrigins),
		handlers.AllowedMethods(s.allowedMethods),
		handlers.MaxAge(s.maxAgePreflight),
		handlers.AllowCredentials(), // Impide que el origen sea dinamico.
	)

	host := fmt.Sprintf(`%s:%d`, s.host, s.port)

	log.Info("Listening and serving HTTP on ", host)

	if err := http.ListenAndServe(host, handlerCors(s.router)); nil != err {
		log.Errorf("Unable to start http server: %s", err.Error())
	}
}
