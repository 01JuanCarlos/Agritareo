package routes

import (
	"ns-api/controllers"
	"ns-api/controllers/agritareo"
	"ns-api/controllers/agritareo/utils"
	"ns-api/core/server"
)

func init() {
	// get pdf
	// server.Post("/insertevaluacioncabecera", agritareo.PostEvaluacionCab) // unused
	server.Post("/insertevaluaciondetalle", agritareo.PostEvaluacionDet) // unused
	server.Get("/encrypt", agritareo.EncriptarData)
	server.Post("/variety/{vid}/concept/{id}/evaluation", agritareo.PostEvaluacion)
	server.Delete("/evaluation/{id}", agritareo.DeleteEvaluation)
	server.Get("/evaluation/{id}", agritareo.GetEvaluationDetail)


	server.Get("/plague-detail", agritareo.GetPlagueDetail)
	server.Get("/sub-concept-threshold", agritareo.GetEtiquetasUmbrales)
	server.Post("/threshold", agritareo.PostUmbral) // umbral
	//server.Post("/campaigns", agritareo.PostCampania) // campaña
	//server.Get("/campaigns", agritareo.GetCampania)
	server.Get("/type-crops", agritareo.GetTipoCultivo)
	// server.Post("/variety", agritareo.PostVariedad) // variedad
	server.Get("/sowing", agritareo.GetSiembras) // siembra
	//siembra by centrocosto
	//server.Post("/cost-centers/{id}/sowing", agritareo.PostSiembra)

	// server.Post("/sowing", agritareo.PostSiembra)         //LEVEL  POST  --
	server.Get("/sowing-map", agritareo.GetSiembrasMap)    //
	server.Post("/coordinates", agritareo.PostCoordenadas) //LEVEL  POST

	server.Get("/last-child-level", agritareo.GetLastChildLevel)
	server.Get("/configuration-levels", agritareo.GetConfigurationLevels)
	server.Post("/configuration-level", agritareo.PostConfigurationLevel) //LEVEL  POST // insertconfigurationlevel 	//LEVEL  POST
	server.Get("/sub-concept", agritareo.GetEtiqueta)

	server.Get("/sub-concept-evaluate", agritareo.GetSubtiqueta)
	server.Post("/sub-concept", agritareo.PostEtiqueta)                    // concepto a evaluar
	server.Post("/sub-concept-evaluate", agritareo.PostSubetiqueta)        // sub concepto a evaluar
	server.Get("/etiquetaBySiembra/{id}", agritareo.GetEtiquetasBySiembra) // ESTE ES DE ETIQUETAS SE VA A CMBIAR MAS ADELANTE

	// ----------
	server.Get("/activities", agritareo.GetFistEvaluation)
	server.Get("/farm", agritareo.GetFarm)
	server.Get("/gdata", agritareo.GetGeneralData)
	server.Get("/trampadata", agritareo.GetTrampaData)
	server.Post("/cost-centers/{cid}/traps", agritareo.CreateTrapsData)
	server.Delete("/cost-centers/{cid}/traps/{tid}", agritareo.DeleteTrapData)
	server.Post("/variety/{vid}/concept/{cid}/threshold", agritareo.CreateThreshold)
	server.Put("/variety/{vid}/concept/{cid}/threshold/{id}", agritareo.UpdateThreshold)
	server.Delete("/variety/{vid}/concept/{cid}/threshold/{id}", agritareo.DeleteThreshold)

	// photos

	server.Put("/evaluation/{eid}/note", agritareo.CreateNote)

	// reportes test
	server.Get("/consulta/{id}/", agritareo.GetApi)
	server.Get("/machinery", agritareo.GetMachinery)
	server.Get("/machinery/{id}", agritareo.DetailMachinery)
	server.Get("/fertilization", agritareo.GetFertilization)
	server.Get("/fertilization/{id}", agritareo.DetailFito)
	server.Get("/irrigation", agritareo.Irrigation)
	server.Get("/irrigation/{id}", agritareo.DetailIrrigation)
	server.Get("/labor", agritareo.Labor)
	server.Get("/labor/{id}", agritareo.DetailLabor)
	server.Get("/labor-cost/{id}", agritareo.DetailLaborCost)
	server.Get("/report/phytosanitary", agritareo.GetPhytosanitary)
	// Reporte de mano de obra
	server.Get("/mano-de-obra", agritareo.GetTableLabor)
	server.Get("/graphic-table-labor/{id}", agritareo.GetTableLaborDetail)
	server.Get("/report-labor", agritareo.GetLabor)
	server.Get("/multi-labor", agritareo.GetLaborMultiDetail)


	// Reporte de cosecha
	server.Get("/harvest", agritareo.GetTableHarvest)
	server.Get("/graphic-table-harvest/{id}", agritareo.GetTableHarvestDetail)
	server.Get("/multi-harvest/{ids}", agritareo.GetMultiHarvestDetail)




	// Reporte de riego grafico / tabla

	server.Get("/graphic-table-irrigation", agritareo.GetGraphicTableIrrigation)

	//Reporte de Ruta

	// Clima
	server.Get("/farm/{id}/climate", agritareo.GetClimate)
	server.Get("/clima", agritareo.GetTableClima)
	server.Get("/multi-clima/{ids}", agritareo.GetClimaMultiDetail)
	server.Get("/lote-clima", agritareo.GetLoteClima)
	//server.Post("/clima", agritareo.CreateClima)
	server.Get("/search/{id}", controllers.Search)
	server.Post("/download", utils.ExportFiles)

	// CONTROLADORES DE RIEGO
	server.Get("/controller-irrigation", agritareo.GetControllerIrrigation)
	server.Get("/controller-irrigation/{id}", agritareo.GetControllerIrrigationDetail)
	server.Post("/controller-irrigation", agritareo.CreateControllerIrrigation)
	server.Put("/controller-irrigation/{id}", agritareo.UpdateControllerIrrigation)
	server.Delete("/controller-irrigation/{id}", agritareo.DeleteControllerIrrigation)

	// CAMPAÑAS AGRICOLAS
	server.Get("/campaign-agricultural", agritareo.GetCampaignAgricultural)
	server.Get("/campaign-agricultural/{id}", agritareo.GetCampaignAgriculturalDetail)
	server.Post("/campaign-agricultural", agritareo.CreateUpdateAgriculturalCampaign)
	server.Put("/campaign-agricultural/{id}", agritareo.CreateUpdateAgriculturalCampaign)
	server.Delete("/campaign-agricultural/{id}", agritareo.DeleteCampaignAgricultural)

	// RUTAS PARA EL MOVIL
	// Evaluador
	server.Get("/app-movil-evaluator", agritareo.GetAppMovilEvaluator)
	server.Get("/app-movil-concept-type", agritareo.GetAppMovilConceptType)
	server.Get("/app-movil-concept", agritareo.GetAppMovilConcept)
	server.Get("/app-movil-sub-concept", agritareo.GetAppMovilSubConcept)
	server.Get("/app-movil-user", agritareo.GetAppMovilUser)
	server.Get("/app-movil-cost-centers", agritareo.GetAppMovilCostCenters)
	server.Get("/app-movil-crops", agritareo.GetAppMovilCrop)
	server.Post("/app-movil-binnacle", agritareo.CreateUpdateBinnacleAppMovil)
	server.Put("/app-movil-binnacle/{id}", agritareo.CreateUpdateBinnacleAppMovil)

}
