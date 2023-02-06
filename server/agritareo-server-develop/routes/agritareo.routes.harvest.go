package routes

import (
	"ns-api/controllers/agritareo"
	"ns-api/core/server"
)

func init() {
	// siembra
	server.Get("/campaigns/{cid}/harvest", agritareo.GetHarvest)
	server.Post("/campaigns/{cid}/harvest", agritareo.CreateHarvest)
	server.Put("/campaigns/{cid}/harvest/{id}", agritareo.UpdateHarvest)
	server.Delete("/campaigns/{cid}/harvest/{id}", agritareo.DeleteHarvest)
	// ----------------
	// campania - cultivo
	//server.Get("/campaigns", agritareo.GetCampaign)
	//server.Get("/campaigns/{id}/crop", agritareo.GetCampaignCrop)

	// controllers de riego

	server.Get("/irrigation-controller", agritareo.GetIrrigationController)
 	// variedad --- fenologias
	//cultivos/1/variedad/1/estados-fenologicos
 	server.Get("/crops/{id}/variety/{vid}/phenological-states", agritareo.PhenologicalStates)
	server.Get("/cost-centers/{id}/coordinates",agritareo.CoordinatesAll)

	// reporte mapa de cosecha
	server.Get("/harvest-report", agritareo.GetHarvestReport)

}