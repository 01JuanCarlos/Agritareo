package sts

type HandlerOptions struct {
	Jwt        bool // Jwt validation
	Privileges bool // Privileges validation
	Validate   bool

	NumOut             int //
	NumIn              int //
	ValidateKey        string
	ReturnError        bool
	ReturnErrorIndex   int
	ReturnResult       bool
	ReturnResultIndex  int
	ReturnMessage      bool
	ReturnMessageIndex int
	ArgsTypes          []string
	OutTypes           []string
	RouteOptions       RouteOptions
	SkipServices       bool
	ControllerName     string
	IsWebsocket        bool
}

type RouteOptions struct {
	Auth         *bool
	Roles        []string
	Privileges   *bool
	ValidateKey  string
	Validate     *bool
	SkipServices *bool
}
