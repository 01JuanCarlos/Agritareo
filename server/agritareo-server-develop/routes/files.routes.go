package routes

import (
	"ns-api/config"
	"ns-api/controllers/agritareo"
	"ns-api/core/server"
	"ns-api/core/sts"
)

func init() {
	//use in binnacle
	server.Get("/show-images", agritareo.GeImage, sts.RouteOptions{Auth: config.NewFalse})
	server.Delete("/images", agritareo.DeleteImage)
	//////////////
	server.Post("/images", agritareo.CreateImage)
	//server.Get("/image", agritareo.GeImageDetail, sts.RouteOptions{Auth: config.NewFalse})
	//server.Delete("/image", agritareo.DeleteImage)
}
