package routes

import (
	"ns-api/controllers/agritareo"
	"ns-api/core/server"
)

func init() {
	server.Get("/crops", agritareo.GetCrop)
	server.Get("/testcrop", agritareo.GetCropsTest)
	server.Get("/crops/{id}", agritareo.GetCropDetail)
	server.Post("/crops", agritareo.CreateCrops)
	server.Put("/crops/{id}", agritareo.UpdateCrops)
	server.Delete("/crops/{id}", agritareo.DeleteCrops)
	server.Patch("/crops/{id}", agritareo.UpdateStatusCrops) // testea urrelo
	//temporal list
	server.Get("/phenology-variety/{id}", agritareo.GetPhenologyVariety)
	server.Get("/phenology-campaign", agritareo.GetZoneVarietyStatus)
	//server.Get("/status-zone-variety/{id}", agritareo.GetZoneVarietyStatus)
	server.Get("/report-list-phytosanitary", agritareo.GetReport)

}
