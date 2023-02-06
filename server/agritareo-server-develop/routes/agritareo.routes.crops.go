package routes

func init() {
	// CROPS - CULTIVOS
	// PLAGUE
	//server.Get("/crops/{id}/plague", agritareo.GetCropsPlague)
	//server.Post("/crops/{id}/plague", agritareo.CreatePlagues) //LEVEL  POST
	//server.Put("/crops/{id}/plague/{pid}", agritareo.UpdatePlague)
	//server.Patch("/crops/{id}/plague/{pid}", agritareo.StatusPlagueCrops)
	//server.Delete("/crops/{id}/plague/{pid}", agritareo.DeletePlagueCrops)
	//
	//// PLAGUE - VARIETY
	//server.Get("/crops/{id}/variety/{vid}/plague", agritareo.GetPlagueByVariedad)
	//server.Post("/crops/{id}/variety/{vid}/plague", agritareo.AssignPlagueCrops) // ASIGNAR VARIEDAD
	//server.Patch("/crops/{id}/variety/{vid}/plague/{pid}", agritareo.UpdateAssignPlagueByVariety)
	//server.Delete("/crops/{id}/variety/{vid}/plague/{pid}", agritareo.DeleteAssignPlagueCrops)

	// VARIETY
	//server.Get("/crops/{id}/variety", agritareo.GetCropsVariety)
	//server.Get("/variety/{id}/concept", agritareo.GetConceptoVariety) // filtra conceptos de variedad
	//server.Post("/crops/{id}/variety", agritareo.CreateVariety)
	//server.Post("/crops/{id}/plague", agritareo.AssignPlagueCrops)
	//server.Post("/crops", agritareo.CreateCrops) // cultivo
	//server.Put("/crops/{id}", agritareo.UpdateCrops)
	//server.Put("/crops/{id}/variety/{vid}", agritareo.UpdateVariety)
	//server.Patch("/crops/{id}/variety/{vid}", agritareo.StatusVariety)
	////
	//server.Delete("/crops/{id}/variety/{vid}", agritareo.DeleteVariety)
	//server.Delete("/crops/{id}", agritareo.DeleteCrops)
	//// PHENOLOGY - VARIETY
	//server.Post("/crops/{id}/variety/{vid}/phenology", agritareo.AssignPhenologyCrops)
	//server.Get("/crops/{id}/variety/{vid}/phenology", agritareo.GetCropsPhenologyByVariety)
	//server.Delete("/crops/{id}/variety/{vid}/phenology/{fid}", agritareo.DeleteAssignPhenologyVariety)
	//server.Patch("/crops/{id}/variety/{vid}/phenology/{fid}", agritareo.UpdateAssignPhenologyByVariety)


	// PHENOLOGY

	//server.Post("/crops/{id}/phenology", agritareo.CreatePhenology)
	//server.Put("/crops/{id}/phenology/{fid}", agritareo.UpdatePhenology)
	//server.Delete("/crops/{id}/phenology/{fid}", agritareo.DeletePhenology)
	//server.Patch("/crops/{id}/phenology/{fid}", agritareo.StatusPhenologyVariety)
	//
	//// PHENOLOGY - CONCEPTOS
	//server.Get("/variety/{vid}/concept/{cid}/status", agritareo.GetPhenologyConcept)
	//server.Put("/concept/{cid}/status/{id}", agritareo.UpdatePhenologyConcept)

	// TRAPS
	//server.Get("/traps", agritareo.GetTraps)
	//server.Post("/traps", agritareo.CreateTraps)
	//server.Put("/traps/{id}", agritareo.UpdateTraps)
	//server.Delete("/traps/{id}", agritareo.DeleteTraps)
	//
	//// CATEGORYS
	//server.Get("/categories", agritareo.GetCategorys)
	//server.Post("/categories", agritareo.CreateCategorys)
	//server.Put("/categories/{id}", agritareo.UpdateCategorys)
	//server.Delete("/categories/{id}", agritareo.DeleteCategorys)

}
