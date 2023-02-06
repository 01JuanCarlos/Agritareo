package server

import (
	"fmt"
	"net/http"
	"ns-api/config"
	"ns-api/core/server/httpserver"
	"ns-api/core/server/wsserver"
	"ns-api/core/services/updater"
	"ns-api/core/sts"
)

var (
	conf        = config.Conf
	_wsServer   wsserver.WsServer
	_httpServer httpserver.HttpServer
)

func init() {
	_httpServer = httpserver.New(httpserver.Options{
		Host:           conf.HttpServer.Host,
		Port:           conf.HttpServer.Port,
		ApiVersion:     config.ApiVersionPath,
		ExposedHeaders: []string{
			config.TransactionHeader,
			"Content-Disposition",
		},
		AllowedHeaders: []string{
			"Content-Type",
			"X-CSRF-Token",
			config.AuthorizationHeader,
			"X-Requested-With",
			config.TransactionHeader,
			config.ComponentIdHeader,
			config.CorporationIdHeader,
		},
		AllowedOrigins: conf.HttpServer.Origins,
		AllowedMethods: []string{
			http.MethodHead,
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodOptions,
			http.MethodDelete,
			http.MethodPatch,
		},
		MaxAgePreflight: config.HttpMaxAgePreflight,
	})

	if true {
		_wsServer = wsserver.New(wsserver.Options{
			Host: conf.HttpServer.Host,
			Port: conf.HttpServer.Port,
		})
		_httpServer.HandleFunc(config.WsServerPath, _wsServer.Handler)
		_httpServer.ExcludeJwtPath(config.WsServerPath)
	}

}

func Run() {
	fmt.Print(config.TerminalSplashText)
	fmt.Println("---dev---")
	go updater.Subscribe()

	if true {
		go _wsServer.Listen()
	}

	_httpServer.Listen()
}

// Export private functions

func Get(path string, handler interface{}, options ...sts.RouteOptions) {
	_httpServer.AddRoute(http.MethodGet, path, handler, options)
}

func Post(path string, handler interface{}, options ...sts.RouteOptions) {
	_httpServer.AddRoute(http.MethodPost, path, handler, options)
}

func Put(path string, handler interface{}, options ...sts.RouteOptions) {
	_httpServer.AddRoute(http.MethodPut, path, handler, options)
}

func Patch(path string, handler interface{}, options ...sts.RouteOptions) {
	_httpServer.AddRoute(http.MethodPatch, path, handler, options)
}

func Delete(path string, handler interface{}, options ...sts.RouteOptions) {
	_httpServer.AddRoute(http.MethodDelete, path, handler, options)
}

func Ws(opCode int, handler interface{}, options ...sts.RouteOptions) {
	if nil != _wsServer {
		_wsServer.AddRoute(opCode, handler, options)
	}
}
