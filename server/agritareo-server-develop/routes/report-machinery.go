package routes

import (
	"ns-api/controllers/agritareo"
	"ns-api/core/server"
)


func init() {
	// Reporte de riego
	server.Get("/table-machinery", agritareo.GetTableMaquinaria)
	server.Get("/graphic-machinery/{id}", agritareo.GetMaquinariaDetail)

	server.Get("/actividad", agritareo.GetActividad)
	server.Get("/maquinista", agritareo.GetMaquinista)
	server.Get("/maquina", agritareo.GetMaquina)



}