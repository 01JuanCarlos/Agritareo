package routes

import (
	"ns-api/controllers/agritareo"
	"ns-api/core/server"
)

func init() {
	// COST-CENTERS
	server.Get("/campaigns", agritareo.GetCampaigns) // Campañas por año
	server.Delete("/cost-centers/{id}", agritareo.DeleteCostCenter)
	// SOWING - SIEMBRAS
	server.Get("/cost-centers/{id}/sowing", agritareo.GetSowing)
	server.Post("/cost-centers/{id}/sowing", agritareo.CreateSowing)
	server.Put("/cost-centers/{id}/sowing/{sid}", agritareo.UpdateSowing)
	server.Delete("/cost-centers/{cid}/sowing/{sid}", agritareo.DeleteSowing)
	// server.Put("/cost-centers/{cid}/sowing/{sid}", agritareo.EditSowing)
	// CAMPAIGNS - CAMPAÑAS
	//server.Get("/cost-centers/{cid}/sowing/{sid}/campaigns", agritareo.GetCampaigns)
	//server.Post("/cost-centers/{cid}/sowing/{sid}/campaigns", agritareo.CreateCampaigns)
	////--------- test format
	//server.Put("/cost-centers/{cos-id}/sowing/{sow-id}/campaigns/{cam-id}", agritareo.UpdateCampaigns)
	server.Patch("/cost-centers/{cos-id}/sowing/{sow-id}/campaigns/{campid}", agritareo.PatchCampaigns)
	//---------
	server.Delete("/cost-centers/{cid}/sowing/{sid}/campaigns/{campid}", agritareo.DeleteCampaigns)

	// COORDINATES
	server.Delete("/cost-centers/{cid}/sowing/{sid}/coordinates/{code}", agritareo.DeleteCoordinates)

	// FIXME MOVER A NIVELES
	server.Get("/company-level-configuration", agritareo.GetCompanyLevelsConfiguration) // niveles
	server.Get("/company-levels-parent", agritareo.GetCompanyLevelsByParent)

	///////////////////// Update endpoints
	server.Get("/cost-centers", agritareo.GetCostCenterOne)
	server.Get("/cost-centers_app_cezl", agritareo.GetCostCenterCEZL)
	server.Get("/cost-centers/{id}", agritareo.GetCostCenter)
	server.Post("/cost-centers", agritareo.CreateCostCenter)
	server.Put("/cost-centers/{id}", agritareo.UpdateCostCenter)
	server.Post("/kml", agritareo.UploadKml)
}
