package httpmessage

import (
	"encoding/json"
	"ns-api/locale"
)

type httpResponseError struct {
	Message       string      `json:"message"`
	Code          int         `json:"code"`
	Severity      int         `json:"level"`
	StatusCode    int         `json:"-"` // todo: delete
	OriginalError error       `json:"-"`
	Fields        interface{} `json:"fields,omitempty"`
	Conflicts     interface{} `json:"conflicts,omitempty"`
}

//

type httpResponseMeta struct {
	RecordsFiltered int64 `json:"recordsFiltered"`
	RecordsTotal    int64 `json:"recordsTotal"`
}

type HttpMessage interface {
	GetError() *httpResponseError
	IsError() bool
	GetResponse() *httpResponse
	GetContentType() string
	GetData() interface{}
	GetLog() interface{}
	GetStatusCode() int
}

type httpResponse struct {
	Data          interface{}        `json:"data"`
	Meta          *httpResponseMeta  `json:"meta,omitempty"`
	Error         *httpResponseError `json:"error,omitempty"`
	Log           interface{}        `json:"-"`
	ContentType   string             `json:"-"`
	InternalError error              `json:"-"`
	IsRawData     bool               `json:"-"`
	StatusCode    int                `json:"-"`
}

func (m *httpResponse) GetStatusCode() (statusCode int) {
	return m.StatusCode
}

func (m *httpResponse) GetData() interface{} {
	return m.Data
}

func (m *httpResponse) GetLog() interface{} {
	return m.Log
}

func (m *httpResponse) GetContentType() string {
	if "" != m.ContentType {
		return m.ContentType
	}

	return "application/json"
}

func (m *httpResponse) GetError() *httpResponseError {
	return m.Error
}

func (m *httpResponse) IsError() bool {
	return nil != m.Error
}

func (m *httpResponse) GetResponse() *httpResponse {
	return m
}

// Public functions

// Send http error message with:
//	(message, ?[status|severity|{fields|conflicts}], ?[status|severity]).
//	(code, ?[message|status|severity|{fields|conflicts}], ?[status|severity]).
//  (error, ?[status|severity|{fields|conflicts}], ?[status|severity]).
//  (status, ?[severity|{fields|conflicts}], ?[severity]).
func Error(args ...interface{}) HttpMessage {
	var response httpResponse
	var err httpResponseError

	if 0 < len(args) {
		arg0 := args[0]
		switch arg0.(type) {
		case string:
			err.Message = arg0.(string)

		case int:
			val := arg0.(int)

			if val >= 100 && val <= 600 {
				response.StatusCode = val
			} else if val >= 2e3 {
				err.Code = arg0.(int)
			} else {
				err.Severity = val
			}

		case error:
			err.Message = arg0.(error).Error()
			err.OriginalError = arg0.(error)
		}

		if 1 < len(args) {
			arg1 := args[1]

			switch arg1.(type) {
			case string:
				err.Message = arg1.(string)
			case int:
				val := arg1.(int)

				if response.StatusCode == 0 && val >= 100 && val <= 600 {
					response.StatusCode = val
				} else if err.Severity == 0 && val < 100 {
					err.Severity = val
				}

			case error:
				err.Message = arg1.(error).Error()
				err.OriginalError = arg1.(error)

			default:
				if locale.ValidationError == err.Code {
					err.Fields = arg1
				} else if locale.ConflictColumn == err.Code {
					err.Conflicts = arg1
				}
			}
		}

		if 2 < len(args) {
			arg2 := args[2]

			switch arg2.(type) {
			case int:
				val := arg2.(int)

				if response.StatusCode == 0 && val >= 100 && val <= 600 {
					response.StatusCode = val
				} else if err.Severity == 0 && val < 100 {
					err.Severity = val
				}
			}
		}

	}

	response.Error = &err

	return &response
}

func Send(data interface{}, log ...interface{}) HttpMessage {
	response := httpResponse{
		Data: data,
	}

	if 0 < len(log) {
		response.Log = log[0]
	}

	return &response
}

func Log(log interface{}) HttpMessage {
	return Send(nil, log)
}

func Raw(data interface{}) HttpMessage {
	return &httpResponse{
		Data:      data,
		IsRawData: true,
	}
}

func Json(data string) HttpMessage {
	return Send(json.RawMessage(data))
}

func Empty() HttpMessage {
	return Raw(nil)
}

func Stream(data []byte, fileType ...string) HttpMessage {
	var contentType string

	if 0 < len(fileType) {
		contentType = fileType[0]
	}

	return &httpResponse{
		Data:        data,
		ContentType: contentType,
	}
}

func Page(data interface{}, filtered int64, total int64) HttpMessage {
	if nil == data {
		data = make([]map[string]interface{}, 0)
	}

	return &httpResponse{
		Data: data,
		Meta: &httpResponseMeta{
			RecordsFiltered: filtered,
			RecordsTotal:    total,
		},
	}
}
