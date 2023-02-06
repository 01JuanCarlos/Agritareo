package routes

import (
	"ns-api/controllers"
	"ns-api/controllers/agritareo"
	"ns-api/core/server"
)

func init() {
	//server.Get("/usuario", agritareo.GetUser)
	server.Get("/evaluacion", agritareo.GetEvaluations)
	server.Get("/evaluacion/{id}", agritareo.GetEvaluationsLote)
	// evaluator
	server.Get("/evaluator", agritareo.GetEvaluators)
	server.Get("/evaluator/{id}", agritareo.GetEvaluatorDetail)
	server.Post("/evaluator", agritareo.CreateUpdateEvaluator)
	server.Put("/evaluator/{id}", agritareo.CreateUpdateEvaluator)
	server.Patch("/evaluator/{id}", controllers.PatchUser)
	//  evaluator  delete
	server.Delete("/evaluator/{id}", agritareo.DeleteEvaluator)
	server.Get("/evaluador", agritareo.GetEvaluador)

}
