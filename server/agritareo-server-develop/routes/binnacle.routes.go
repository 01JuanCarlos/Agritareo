package routes

import (
	"ns-api/controllers/agritareo"
	"ns-api/core/server"
)

func init() {
	server.Get("/binnacle", agritareo.GetBinnacle)
	server.Get("/binnacleTable", agritareo.GetBinnacleTable)
	server.Get("/binnacle/{id}", agritareo.GetBinnacleDetail)
	server.Post("/binnacle", agritareo.CreateUpdateBinnacle)
	server.Put("/binnacle/{id}", agritareo.CreateUpdateBinnacle)
	server.Delete("/binnacle/{id}", agritareo.DeleteBinnacle)

	/////////////////// Adicionales
	server.Get("/plot-data", agritareo.GetPlotData)             // detalle
	server.Get("/binnacle-type", agritareo.GetBinnacleTypeList) // select type
	server.Get("/binnacle-evaluation/{id}", agritareo.UpdateBinnacleEvaluation)

	server.Get("/subconcept", agritareo.SubConcepts)
	server.Get("/subconcept-cezl", agritareo.SubConceptsCEZL)
	server.Get("/evaluacion-app", agritareo.EvaluacionesApp)

	server.Get("/threshold-method", agritareo.Threshold)
	//------------------------------
	//################REPORTES

	server.Get("/phytosanitary-report", agritareo.GetPhytosanitaryReport)
	server.Get("/phytosanitary-detail/{id}", agritareo.GetPhytosanitaryDetailReport)
	server.Get("/phytosanitary-day-detail/{id}", agritareo.GetPhytosanitaryDetail)
	server.Get("/phytosanitary-report-graphic", agritareo.GetPhytosanitaryReportGraphic)

	// Reporte de rutas
	server.Get("/phytosanitary-route-report", agritareo.GetPhytosanitaryRouteReport)
	server.Get("/phytosanitary-route-report/{id}", agritareo.GetPhytosanitaryDetailRouteReport)

	//DASHBOARD
	server.Get("/dashboard-evaluator", agritareo.GetEvaluatorsDashBoard)
}
