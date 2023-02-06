package routes

import (
	"ns-api/controllers/agritareo"
	"ns-api/core/server"
)

func init() {
	server.Get("/evaluation-method", agritareo.GetEvaluationMethod)
	server.Get("/evaluation-method/{id}", agritareo.GetEvaluationMethodDetail)
	server.Post("/evaluation-method", agritareo.CreateUpdateEvaluationMethod)
	server.Put("/evaluation-method/{id}", agritareo.CreateUpdateEvaluationMethod)
	server.Delete("/evaluation-method/{id}", agritareo.DeleteEvaluationMethod)

	// entry
	server.Get("/entry-types", agritareo.GetEvaluationTypeEntry)
}
