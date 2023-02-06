package routes

import (
	"ns-api/controllers"
	"ns-api/core/server"
)

func init() {
	server.Get("/tables", controllers.GetTables)
	server.Get("/procedures", controllers.GetProcedures)
}
