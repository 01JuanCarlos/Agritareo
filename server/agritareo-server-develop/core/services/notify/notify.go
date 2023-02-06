package notify

import (
	"ns-api/core/server/wsserver"
)

type Type uint8

const (
	DangerType Type = iota
	SuccessType
	WarningType
	InfoType
	TaskType
	SystemType
)

type Notify struct {
	Type    Type   `json:"type"`
	Message string `json:"message"`
	Time    int64  `json:"time"`
}

func Broadcast(message string, _type Type) {
	wsserver.Broadcast(100, "Mensaje del futuro")
	//<- &sts.WsResponse{
	//	OpCode: sts.NotifyServerCode,
	//	Data: &Notify{
	//		Type:    _type,
	//		Message: message,
	//		Time:    time.Now().Unix(),
	//	},
	//	ClientUid: "112", // Generar un UUID para el server.
	//}
}

func Send(user *wsserver.WsClient, message string, _type Type) {
	//user.Send(sts.NotifyServerCode, &Notify{
	//	Type:    _type,
	//	Message: message,
	//	Time:    time.Now().Unix(),
	//})
}
