package sts

type HttpErrorResponse struct {
	Message    string           `json:"message"`
	Code       int              `json:"code"`
	Level      int              `json:"level"`
	StatusCode int              `json:"-"`
	Fields     *[]ValidateError `json:"fields,omitempty"`
	Data       interface{}      `json:"data,omitempty"`
}

type HttpMetaResponse struct {
	RecordsFiltered int64  `json:"recordsFiltered"`
	RecordsTotal    int64  `json:"recordsTotal"`
	ProcedureData   string `json:"dataId,omitempty"`
}

type HttpResponse struct {
	Data          interface{}        `json:"data"`
	Meta          *HttpMetaResponse  `json:"meta,omitempty"`
	Error         *HttpErrorResponse `json:"error,omitempty"`
	Log           interface{}        `json:"-"`
	ContentType   string             `json:"-"`
	InternalError error              `json:"-"`
}
