package config

import "time"

const (
	AppName                 = "Nisira ERP"
	MssqlPrefix             = "NS"
	MssqlSchema             = "dbo"
	MssqlMaxQueryDuration   = 70 * time.Second
	ExpireTokenTime         = time.Hour * 12
	PayloadTokenKey         = "ns.token.payload"
	ReceivedTimeKey         = "ns.token.received.time"
	PayloadConnectionId     = "ns.token.payload::connectionId"
	JwtSkipValidation       = "ns.token.skip::validation"
	ApiVersionPath          = "v1"
	WsServerPath            = "v1/ws"
	HttpMaxAgePreflight     = 600
	HttpDefaultContentType  = "application/json"
	SessionCookieName       = "NSSESSID20"
	TokenCookieName         = "token"
	StrictNoSqlVerification = true

	// keys
	IdKey            = "id"
	TransactionIdKey = "transaction_uid"
	CompanyIdKey     = "idempresa"

	// Http Headers

	TransactionHeader      = "Ns-Transaction"
	ComponentIdHeader      = "Ns-Component-Id"
	CorporationIdHeader    = "Ns-Corporation-Id"
	ModuleIdHeader         = "Ns-Module-Id"
	AuthorizationHeader    = "Authorization"
	AuthorizationTokenType = "Bearer"
)

const TerminalSplashText = `
    _   ___________ ________  ___       _______  _____________________  ________      __________  ____ 
   / | / /  _/ ___//  _/ __ \/   |     / ___/\ \/ / ___/_  __/ ____/  |/  / ___/     / ____/ __ \/ __ \
  /  |/ // / \__ \ / // /_/ / /| |     \__ \  \  /\__ \ / / / __/ / /|_/ /\__ \     / __/ / /_/ / /_/ /
 / /|  // / ___/ // // _, _/ ___ |    ___/ /  / /___/ // / / /___/ /  / /___/ /    / /___/ _, _/ ____/ 
/_/ |_/___//____/___/_/ |_/_/  |_|   /____/  /_//____//_/ /_____/_/  /_//____/    /_____/_/ |_/_/     
`

func newBool(b bool) *bool {
	return &b
}

var NewTrue = newBool(true)
var NewFalse = newBool(false)
