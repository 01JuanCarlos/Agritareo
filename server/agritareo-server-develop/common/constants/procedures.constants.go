package constants

const (
	// LOGIN
	PCheckLogin = "CHECKLOGIN"
	//INITIAL
	PInitialData   = "INITIAL_DATA"
	PInitialModule = "INITIAL_MODULE"
	//USER
	PInsertUser = "USUARIO_I"
	PUpdateUser = "USUARIO_U"
	PPatchUser  = "USUARIO_A"
	PPatchPwd   = "USERAUTH"
	//PERFIL
	PInsertProfile = "PERFIL_I"
	PUpdateProfile = "PERFIL_U"
	PPatchProfile  = "PERFIL_A"
	// PRODUCT
	PInsertProduct = "PRODUCTOS_I"
	PUpdateProduct = "PRODUCTOS_U"
	PPatchProduct  = "PRODUCTOS_A"
	PDeleteProduct = "PRODUCTOS_D"
	// BRAND
	PInsertBrand = "MARCA_I"
	PUpdateBrand = "MARCA_U"
	PPatchBrand  = "MARCA_A"
	// MODEL
	PInsertModel = "MODELO_I"
	PUpdateModel = "MODELO_U"
	PPatchModel  = "MODELO_A"
	// UNIT
	PInsertUnit = "UNIMEDIDA_I"
	PUpdateUnit = "UNIMEDIDA_U"
	// UTILS
	PGetSuggest             = "SUGGEST_F"
	PMenuIU                 = "MENU_IU"
	PInsertComponentProfile = "PERFILCOMPONENTE_I"
	PGetComponentsFormPrint = "COMPONENTESFRMTIMPRESION_F"
	PGetProfileInitialData  = "PERFILDATAINICIAL_F"
	PGetProfileComponent    = "PERFILCOMPONENTE_F"
	// COMPONENTS
	PGetComponents          = "COMPONENTES_F"
	PGetComponentsFormat    = "COMPONENTE_FORMATOIMPRESION_F" //
	PInsertComponentsFormat = "COMPONENTE_FORMATOIMPRESION_I"
	// REPORT FORMAT
	PGetFormatsPrint    = "FORMATOSIMPRESION_F"
	PInsertFormatsPrint = "FORMATOSIMPRESION_I"
	PUpdateFormatsPrint = "FORMATOSIMPRESION_U"
	PDeleteFormatsPrint = "FORMATOSIMPRESION_D"
	// PARAMETERS COMPANY
	PGetParametersCompany    = "PEMPRESA_F"
	PInsertParametersCompany = "PEMPRESA_I"
	PUpdateParametersCompany = "PEMPRESA_COMPONENTE_U"
	// FORMAT PRINT
	PGetFormatPrint = "FORMATOIMPRESIONPRINT_F"
	// table
	TableFormat = "TABLAFORMATOS_F"
	// Grupo
	PInsertGroup  = "GRUPO_I"
	PUpdateGroup  = "GRUPO_U"
	PInsertSGroup = "GRUPO_SUBGRUPO_I"
	PUpdateSGroup = "GRUPO_SUBGRUPO_U"
	// ESTADO
	PInsertState = "ESTADO_I"
	PUpdateState = "ESTADO_U"
	PPatchState  = "ESTADO_A"
	//
	// ESTADO
	PInsertArea = "AREA_I"
	PUpdateArea = "AREA_U"
	PPatchArea  = "AREA_A"
	// SUCURSAL
	PInsertBranchOffice = "SUCURSAL_I"
	PUpdateBranchOffice = "SUCURSAL_U"
	PPatchBranchOffice  = "SUCURSAL_A"
	// ALMACEN
	PInsertWareHouse = "ALMACEN_I"
	PUpdateWareHouse = "ALMACEN_U"
	PPatchWareHouse  = "ALMACEN_A"
	// PARAMETERS MODULE
	PGetParametersList = "INITIAL_PARAMETERS_F"
	//formComponentsdev
	PGetFormatComponent    = "FORMATOSCOMPONENTE_F"
	PInsertFormatComponent = "FORMATOCOMPONENTE_I"
	//SUBGROUP
	PInsertSubGroup = "SUBGRUPO_I"
	PUpdateSubGroup = "SUBGRUPO_U"
	// CURRENCY
	PInsertCurrency = "MONEDA_I"
	PUpdateCurrency = "MONEDA_U"
	// DOCUMENT
	PInsertDocument = "DOCUMENTO_I"
	PUpdateDocument = "DOCUMENTO_U"
	// SERIE
	PInsertSerie = "SERIE_I"
	PUpdateSerie = "SERIE_U"
	// ORDER
	PInsertOrder = "PEDIDO_I"
	PUpdateOrder = "PEDIDO_U"
	// ORDER DESCRIPTION
	PInsertOrderDescription = "PEDIDO_D_I"
	PUpdateOrderDescription = "PEDIDO_D_U"
	// EQUIVALENCE
	PInsertEquivalence = "CONVERSION_I"
	PUpdateEquivalence = "CONVERSION_U"
	// PRODUCT COMPANY
	PInsertProductComapny = "PRODUCTO_E_I"
	PUpdateProductCompany = "PRODUCTO_E_U"
	// CLIEPROV GENERAL
	PInsertClieprov = "CLIEPROV_I"
	PUpdateClieprov = "CLIEPROV_U"
	// USER PREFRERENCES
	PGetUserPreferences    = "PREFERENCIAS_USUARIO_F"
	PInsertUserPreferences = "PREFERENCIAS_USUARIO_U"
	// COMPANY PREFERENCES
	PGetCompanyPreferences    = "PREFERENCIAS_EMPRESA_F"
	PInsertCompanyPreferences = "PREFERENCIAS_EMPRESA_U"
	// components
	PInsertComponent = "COMPONENTE_I"
	PUpdateComponent = "ESTRUCTURACOMPONENTE_U"
	//
	PInsertModule        = "MODULO_I"
	PUpdateModule        = "MODULO_U"
	PGetModuleComponents = "MODULOCOMPONETE_L"
	//Params
	PInsertParams = "PARAMETRO_I"
	PUpdateParams = "PARAMETRO_U"
	// Internal Req
	PInsertInternalReq = "REQUERIMIENTO_INTERNO_I"
	PUpdateInternalReq = "REQUERIMIENTO_INTERNO_U"
)

// neims teibols :v
var CurrentTables  =  map[string]string {
	PDeleteProduct: "TMPRODUCTO",
}