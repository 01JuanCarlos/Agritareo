package routes

import (
	"ns-api/config"
	"ns-api/controllers"
	"ns-api/core/server"
	"ns-api/core/sts"
)

func init() {
	server.Post("/login", controllers.PostLogin, sts.RouteOptions{Auth: config.NewFalse})
	server.Post("/login-app", controllers.PostLoginApp, sts.RouteOptions{Auth: config.NewFalse})
	server.Post("/renew-session", controllers.PostRenewLoginSession)
	server.Get("/logout", controllers.Logout, sts.RouteOptions{Privileges: config.NewFalse})
}
