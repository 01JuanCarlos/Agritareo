package routes

import (
	"ns-api/controllers/agritareo"
	"ns-api/core/server"
)

func init() {
	// Get Zona
	server.Get("/report-zona", agritareo.GetZona)

	// Get Concepto
	server.Get("/report-concept", agritareo.GetConcept)

	// Get Cultivo
	server.Get("/report-cultivo", agritareo.GetCultivo)

	// Get Organo afectado
	server.Get("/report-organo", agritareo.GetOrgano)

	// Get Lote
	server.Get("/report-lote", agritareo.GetLote)
	server.Get("/report-cosecha-lote", agritareo.GetLoteCosecha)
	server.Get("/report-sector", agritareo.GetSector)
	server.Get("/report-manoObra", agritareo.GetManoObra)
	server.Get("/empresa", agritareo.GetEmpresa)

	//GRAFICO/TABLA FITOSANIDAD
	server.Get("/graphic-table-phytosanitary", agritareo.GetGraphicTablePhytosanitary)
	server.Get("/graphic-table-phytosanitary/{id}", agritareo.GetGraphicTablePhytosanitaryDetail)
	server.Get("/multi-phytosanitary/{ids}", agritareo.GetGraphicTablePhytosanitaryDetailMultiple)
	server.Get("/table-image", agritareo.GetImageBinnacle)
	server.Get("/table-image/{id}", agritareo.GetImageDetail)

}
