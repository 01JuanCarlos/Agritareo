package routes

import (
	"ns-api/controllers/warehouse"
	"ns-api/core/server"
)

func init() {
	server.Post("/internal-requirement", warehouse.PostInternalReq)
	server.Put("/internal-requirement/{id}", warehouse.PutInternalReq)
}