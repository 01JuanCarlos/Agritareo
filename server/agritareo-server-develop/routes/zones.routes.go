package routes

import (
	"ns-api/controllers/agritareo"
	"ns-api/core/server"
)

func init() {
	server.Get("/geographical-zones", agritareo.GetZone)
	server.Get("/geographical-zones/{id}", agritareo.GetZoneDetail)
	server.Post("/geographical-zones", agritareo.CreateZone)
	server.Put("/geographical-zones/{id}", agritareo.UpdateZone)
	server.Delete("/geographical-zones/{id}", agritareo.DeleteZone)
}