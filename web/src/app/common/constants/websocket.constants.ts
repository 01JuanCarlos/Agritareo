// Codigos de peticion del cliente.
export enum WSCLIENT {
  AUTHENTICATE,
  TRANSACTION,

  CHAT_ROOM = 1e3,
  CHAT_MESSAGE,
  GET_COMPONENT_CONFIG,
  GET_CUSTOM_LAYOUT,
  SAVE_CUSTOM_LAYOUT,
  GET_ACTIVITY,

  GET_CUSTOM_LABELS,
  RESET_CUSTOM_LABELS
}

// Codigos de respuesta del servidor.
export enum WSSERVER {
  AUTHENTICATED,
  TRANSACTION,
  AUTHENTICATE_ERROR,
  NOTIFY,

  CHAT_MESSAGE = 1e3,
  COMPONENT_CONFIG,
  CUSTOM_LAYOUT,
}
