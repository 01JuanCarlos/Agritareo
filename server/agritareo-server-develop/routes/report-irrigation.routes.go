package routes

import (
	"ns-api/controllers/agritareo"
	"ns-api/core/server"
)


func init() {
	// Reporte de riego
	server.Get("/table-irrigation", agritareo.GetTableIrrigation)
	server.Get("/graphic-table-irrigation/{id}", agritareo.GetTableIrrigationDetail)
	server.Get("/multi-irrigation/{ids}", agritareo.GetTableIrrigationMultiDetail)
	server.Get("/irrigation-report", agritareo.GetIrrigationReport)
	server.Get("/report-riego-lote", agritareo.GetLoteRiego)

	server.Get("/table-agua", agritareo.GetTableAgua)
	server.Get("/total-agua", agritareo.GetTotalAgua)
	server.Get("/report-agua", agritareo.GetLoteAgua)
	server.Get("/graphic-agua-consumo/{id}", agritareo.GetConsumoAguaDetail)



}