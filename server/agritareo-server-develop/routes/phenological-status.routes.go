package routes

import (
	"ns-api/controllers/agritareo"
	"ns-api/core/server"
)

func init()  {
	server.Get("/phenological-status", agritareo.GetPhenologicalStatus)
	server.Get("/phenological-status/{id}", agritareo.GetPhenologicalStatusDetail)
	server.Post("/phenological-status", agritareo.CreatePhenologicalStatus)
	server.Put("/phenological-status/{id}", agritareo.UpdatePhenologicalStatus)
	server.Delete("/phenological-status/{id}", agritareo.DeletePhenologicalStatus)

}