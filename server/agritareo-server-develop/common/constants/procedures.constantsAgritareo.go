package constants

const (
	PInsertPlagueCrops            = "PLAGA_VARIEDAD_CULTIVO_I"
	PGetPlagueCrops               = "PLAGA_VARIEDAD_CULTIVO_L"
	PInsertPhenologyVarietyCrops  = "FENOLOGIA_VARIEDAD_CULTIVO_I"
	PListPhenologyCultivoVariedad = "FENOLOGIA_VARIEDAD_CULTIVO_L"
	DeleteAssignPhenologyVariety  = "FENOLOGIA_VARIEDAD_CULTIVO_D"
	UpdateAssignPhenologyVariety  = "FENOLOGIA_VARIEDAD_CULTIVO_A"
	UpdatePhenologyCrops          = "FENOLOGIA_CULTIVO_A"
	PInsertVariety                = "VARIEDAD_I"
	UpdateStatusVariety           = "CULTIVO_VARIEDAD_A"
	PUpdateVariety                = "VARIEDAD_U"
	PDeleteVariety                = "VARIEDAD_D"
	DeleteAssignPlagueCrops       = "PLAGA_CULTIVO_D"
	UpdateStatusPlagueCrops       = "PLAGA_CULTIVO_A"
	PUpdateAssignPlagueCrops      = "PLAGA_VARIEDAD_CULTIVO_A"
	PInsertEvaluator              = "EVALUADOR_I"
	PUpdateEvaluator              = "EVALUADOR_U"
	PDeleteEvaluator              = "EVALUADOR_D"
	PUpdateCampaigns              = "CAMPANIA_U"
	PDeleteCampaigns              = "CAMPANIA_D"
	PPatchCampaigns               = "CAMPANIA_A"
	ListCampaignsCostCenter       = "CENTROCOSTO_CAMPANIA_L"
	PInsertCostCenter             = "CENTROCOSTO_I"
	PGetEtiquetasBySiembras       = "CONCEPTOS_L"
	PGetAssignedPhenology         = "VARIEDAD_FENOLOGIAS_L"
	PDeleteLevel                  = "NIVEL_CENTROCOSTO_D"
	PUpdateCompanyLevel           = "NIVEL_CENTROCOSTO_U"
	PDeleteSowing                 = "SIEMBRA_D"
	PGetSowing                    = "SIEMBRA_L"
	PInsertSowing                 = "SIEMBRA_I"
	PUpdateSowing                 = "SIEMBRA_U"
	PDeleteCoordinates            = "COORDENADAS_D"
	PUpdateStatusConcept          = "CONCEPTO_A"
	PInsertConcept                = "CONCEPTO_I"
	PUpdateConcept                = "CONCEPTO_U"
	PDeleteConcept                = "CONCEPTO_D"
	PInsertThreshold              = "UMBRAL_I"
	PGetFirstEvaluation           = "FIRST_EVALUATIONS_L"
	PInsertHarvest                = "COSECHA_I"
	PUpdateHarvest                = "COSECHA_U"
	PDeleteHarvest                = "COSECHA_D"
	PUpdateNote                   = "NOTA_U"
	PInsertImage                  = "IMAGEN_I"

	//-------------------------------------------------- [refactor] All names SP
	//EVALUACION AGRITAREO
	PInsertEvaluacionCab = "EVALUACION_CAB_I"
	PInsertEvaluacionDet = "EVALUACION_DET_I"
	PGetEvaluaciones     = "EVALUACION_L"
	PInsertEvaluacion    = "EVALUACION_I"

	TInsertTrampa = "TRAMPA_I"
	TUpdateTrampa = "TRAMPA_U"
	TDeleteTrampa = "TRAMPA_D"

	TInsertTrampaCategoria = "TRAMPA_CATEGORIA_I"
	TUpdateTrampaCategoria = "TRAMPA_CATEGORIA_U"
	TDeleteTrampaCategoria = "TRAMPA_CATEGORIA_D"

	CInsertClima = "CLIMA_I"

	PDeleteCrops      = "CULTIVO_D"
	PInsertCultivos   = "CULTIVO_I"
	PUpdateCultivo    = "CULTIVO_U"
	PListarCultivos   = "CULTIVO_L"
	UpdateStatusCrops = "CULTIVO_A"

	// TRAMPA - DATA
	PInsertTrampaData = "TRAMPADATA_I"
	PDeleteTrampaData = "TRAMPADATA_D"

	//VARIEDADES AGRITAREO
	PListarVariedades = "VARIEDADES_LIST"

	PListarConceptosVariedades = "CONCEPTO_VARIEDAD_L"

	//UMBRALES
	PListarConceptosByFenologias = "VARIEDAD_CONCEPTO_FENOLOGIA_L"
	PUpdateConceptosByFenologias = "VARIEDAD_CONCEPTO_FENOLOGIA_U"

	//
	PListarFenologias = "FENOLOGIA_L"
	PInsertFenologia  = "FENOLOGIA_I"
	PDeleteFenologia  = "FENOLOGIA_D"
	PUpdateFenologia  = "FENOLOGIA_U"
	PInsertUmbral     = "UMBRAL_I"
	//PLAGAS
	PUpdatePlaga              = "PLAGA_U"
	PListarPlaga              = "PLAGA_L"
	PInsertPlaga              = "PLAGA_I"
	PDeletePlaga              = "PLAGA_D"
	PGetPlagueDetail          = "PLAGA_DETALLE_L"
	PListPlagaCultivoVariedad = "PLAGA_CULTIVO_L"
	PListEtiqueta             = "ETIQUETA_L"
	PListConceptos            = "CONCEPTOS_L"
	PListSubetiqueta          = "SUBETIQUETA_L"
	PInsertEtiqueta           = "ETIQUETA_I"
	PListEtiquetaUmbrales     = "ETIQUETAUMBRALES_L"
	PInsertSubetiqueta        = "SUBETIQUETA_I"
	//CAMPANIA
	PInsertCampania = "CAMPANIA_I"
	PListCampania   = "CAMPANIA_L"

	PListarSiembraKENEDI = "SIEMBRAKENEDI_L"
	PListarSiembraM      = "SIEMBRAS_L"
	//NIVELES AGRITAREO
	PListarNiveles                  = "LIST_MTNIVEL"
	PListConfigurationLevels        = "LIST_TMNIVEL_SELECCION"
	PListCompanyLevels              = "NIVEL_EMPRESA_L"
	PListCostCenters                = "CENTROCOSTO_L"
	PlistLotes                      = "COORDENADAS_LOTES_SECTOR"
	ReporteFitosanidad              = "REPORTE_FITOSANIDAD_L"
	PListCompanyLevelsGalter        = "NIVEL_EMPRESAG_L"
	PListCompanyLevelsConfiguration = "NIVEL_CONFIGURACION_L"
	PInsertConfigurationLevel       = "NIVEL_CONFIGURACION_I"
	PInsertCompanyLevel             = "CENTROCOSTO_I"
	PInsertCompanyLevelF            = "CENTROCOSTO_F"

	PListCompanyLevelsByParent = "COMPANY_LEVEL_L"
	PLastChildLevel            = "LAST_CHILD_LEVEL"

	// Coordenadas
	PInsertCoordenadas = "COORDENADAS_I"
	////////////////////////////////////
	DetailSuffix       = "_F"
	ListSuffix         = "_L"
	InsertUpdateSuffix = "_I"
	DeleteSuffix       = "_D"
	SaveSuffix		   = "_S"
)
