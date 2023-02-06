package routes

import (
	"ns-api/common/constants"
	"ns-api/controllers"
	"ns-api/core/server"
)

func init() {
	server.Ws(constants.WsGetChatRoom, controllers.GetChatRoom)
	server.Ws(constants.WsChatMessage, controllers.AddMessage)
	server.Ws(constants.WsClientGetCustomLayout, controllers.GetCustomLayout)
	server.Ws(constants.WsClientSaveCustomLayout, controllers.SaveCustomLayout)
	server.Ws(constants.WsClientGetActivity, controllers.GetActivity)
	server.Ws(constants.WsClientGetCustomLabels, controllers.GetLabels)
	server.Ws(constants.WsClientDeleteCustomLabels, controllers.DeleteLabels)
}
