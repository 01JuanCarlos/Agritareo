package constants

// Server Opcode
const (
	WsServerChatMessage int = iota + 1e3
	WsServerComponentConfig
	WsServerCustomLayout
)

// Cliente
const (
	WsGetChatRoom int = iota + 1e3
	WsChatMessage
	WsClientGetComponentConfig
	WsClientGetCustomLayout
	WsClientSaveCustomLayout
	WsClientGetActivity
	WsClientGetCustomLabels
	WsClientDeleteCustomLabels
	WsClientGetDefaultValues
	WsClientSaveDefaultValues
	WsClientDeleteDefaultValues
)
