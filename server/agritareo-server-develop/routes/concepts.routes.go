package routes

import (
	"ns-api/controllers/agritareo"
	"ns-api/core/server"
)

func init() {

	//////////////////concept-type
	server.Get("/concept-type", agritareo.GetConceptType)
	server.Get("/concept-type/{id}", agritareo.GetConceptTypeDetail)
	server.Post("/concept-type", agritareo.CreateConceptType)
	server.Put("/concept-type/{id}", agritareo.UpdateConceptType)
	server.Delete("/concept-type/{id}", agritareo.DeleteConceptType)
	/////////// concept
	server.Get("/concept", agritareo.GetConceptAgricola)
	server.Get("/concept/{id}", agritareo.GetConceptAgricolaDetail)
	server.Post("/concept", agritareo.CreateUpdateConceptAgricola)
	server.Put("/concept/{id}", agritareo.CreateUpdateConceptAgricola)
	server.Delete("/concept/{id}", agritareo.DeleteConceptAgricola)

}
