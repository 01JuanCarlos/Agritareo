package routes

import (
	"ns-api/config"
	"ns-api/controllers"
	"ns-api/controllers/agritareo"
	"ns-api/controllers/warehouse"
	"ns-api/core/server"
	"ns-api/core/sts"
)

func init() {
	server.Get("/app", controllers.GetApp, sts.RouteOptions{Auth: config.NewFalse})
	server.Get("/snt", controllers.GetSunat)
	server.Get("/ruc/{id}", controllers.GetRuc, sts.RouteOptions{Auth: config.NewFalse})
	server.Get("/sbs", controllers.GetSbs)
	server.Post("/initial", controllers.PostInitial, sts.RouteOptions{Privileges: config.NewFalse})
	server.Get("/profile", controllers.GetProfile, sts.RouteOptions{Privileges: config.NewFalse})
	server.Get("/profiletype", controllers.GetProfileType, sts.RouteOptions{Privileges: config.NewFalse})
	server.Get("/data-handler", controllers.GetDataHandler)
	server.Delete("/data-handler/{id}", controllers.DeleteDataHandler)
	server.Get("/form-modules", controllers.GetFormModules)
	server.Patch("/pwd", controllers.PatchUserPwd)
	server.Post("/user", controllers.PostUser)
	server.Put("/user/{id:[0-9]+}", controllers.PutUser)
	server.Patch("/user/{id}", controllers.PatchUser)
	server.Post("/profile", controllers.PostProfile)
	server.Get("/permissionsprofile/{id}", controllers.PermissionProfile)
	server.Put("/profile/{id}", controllers.PutProfile)
	server.Patch("/profile/{id}", controllers.PatchProfile)
	server.Put("/preview-report", controllers.PutPreviewReport, sts.RouteOptions{Auth: config.NewFalse})
	server.Get("/preview-report", controllers.GetPreReport, sts.RouteOptions{Auth: config.NewFalse})
	server.Post("/report", controllers.PostReport) // fixme no usa transaction
	server.Get("/report/{id}", controllers.GetReport)
	server.Put("/report/{id}", controllers.PutReport)
	//server.Delete("/report/{id}", controllers.DeleteReport)
	server.Get("/components", controllers.GetComponents)
	server.Get("/components-format/{id}", controllers.GetComponentFormat)
	server.Put("/components-format/{id}", controllers.PostComponentFormat) // pal walter
	server.Get("/format-component/{id}", controllers.GetFormatComponent, sts.RouteOptions{
		Privileges: config.NewFalse,
	})
	server.Post("/format-component", controllers.PostFormatComponent, sts.RouteOptions{
		Privileges: config.NewFalse,
	})
	server.Post("/component", controllers.PostComponent)
	server.Put("/component/{id}", controllers.PutComponent)
	server.Post("/producto", warehouse.PostProduct)
	server.Put("/producto/{id}", warehouse.PutProduct)
	server.Patch("/producto/{id}", warehouse.PatchProduct)
	server.Delete("/producto/{id}", warehouse.DeleteProduct)
	server.Post("/mail", controllers.PostEmail)
	server.Post("/menu-setup", controllers.PostMenuSetup)
	server.Post("/settings/{id}", controllers.PostSettings)
	server.Get("/settings/{id}", controllers.GetSettings)
	server.Get("/privileges", controllers.GetPrivileges, sts.RouteOptions{Privileges: config.NewFalse})
	server.Post("/privileges", controllers.PostPrivileges)
	server.Get("/parameters-company", controllers.GetParametersCompany)
	server.Post("/parameters-company", controllers.PostParametersCompany)
	server.Put("/parameters-company/{id}", controllers.UpdateParametersCompany)
	server.Get("/log/{id}", controllers.GetLogID)
	server.Post("/note", controllers.PostNote)
	server.Delete("/note/{id}", controllers.DeleteNote)
	server.Get("/note", controllers.GetNote)
	server.Get("/table-format/{id}", controllers.GetTableFormat)
	server.Put("/table-config/{id}", controllers.PutTableConfig)
	server.Get("/table-config/{id}", controllers.GetTableConfig)
	server.Get("/parameters-module-list", controllers.GetListModule)
	server.Get("/document-serie", warehouse.GetDocument, sts.RouteOptions{Privileges: config.NewFalse})
	server.Post("/order", warehouse.PostOrder)
	server.Put("/order/{id}", warehouse.PutOrder)
	server.Post("/order-description", warehouse.PostOrderD)
	server.Put("/order-description/{id}", warehouse.PutOrderD)
	server.Post("/equivalence", warehouse.PostEquivalence)
	server.Put("/equivalence/{id}", warehouse.PutEquivalence)
	server.Post("/product-company", warehouse.PostProductCompany)
	server.Put("/product-company/{id}", warehouse.PutProductCompany)
	server.Get("/user-preferences", controllers.GetUserPreferences)
	server.Put("/user-preferences/{id}", controllers.PostUserPreferences)
	server.Get("/company-preferences", controllers.GetCompanyPreferences)
	server.Post("/company-preferences", controllers.PostCompanyPreferences)
	server.Post("/parameters", controllers.PostParameters)
	server.Put("/parameters/{id}", controllers.PutParameters)
	server.Post("/module", controllers.PostModule)
	server.Put("/module/{id}", controllers.PutModule)
	server.Get("/module-components/{id}", controllers.GetModuleComponents)
	server.Get("/filter", controllers.GetFilter)
	server.Get("/print", controllers.GetPrint)
	server.Post("/mnthandler", controllers.PostMntHandler, sts.RouteOptions{Validate: config.NewTrue})
	server.Put("/mnthandler/{id}", controllers.PutMntHandler, sts.RouteOptions{Validate: config.NewTrue})
	server.Patch("/mnthandler/{id}", controllers.PatchMntHandler, sts.RouteOptions{Validate: config.NewTrue})
	server.Delete("/mnthandler/{id}", controllers.DeleteMntHandler)
	server.Get("/mnthandler/{id}", controllers.GetIdMntHandler)
	server.Get("/suggest", controllers.GetSuggest, sts.RouteOptions{Privileges: config.NewFalse})
	//server.Get("/test", controllers.AppTestController)
	//server.Post("/test", controllers.AppTestController2)
	server.Get("/changelog", controllers.GetChangelog, sts.RouteOptions{
		Auth: config.NewFalse,
	})
	server.Post("/reception-guide", warehouse.PostReceptionGuide)
	server.Put("/reception-guide/{id}", warehouse.PutReceptionGuide)
	/////////////
	server.Get("/component-parameters/{id}", agritareo.GetParams)
}
