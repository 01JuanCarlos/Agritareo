package server

import (
	"encoding/json"
	"fmt"
	"ns-api/common/constants"
	"ns-api/core/sts"
	"ns-api/core/util"
	"ns-api/locale"
	"strings"
)

func RawMessage(result string, args ...interface{}) *sts.HttpResponse {
	return Message(json.RawMessage(result), args...)
}

func EmptyMetaMessage() *sts.HttpResponse {
	return MetaMessage(nil, nil)
}

func MetaMessage(data interface{}, meta *sts.HttpMetaResponse) *sts.HttpResponse {
	var response sts.HttpResponse

	if nil == data {
		data = `[]` // Crear data vacia para las tablas
	}

	dataType := fmt.Sprintf(`%T`, data)

	if "string" == dataType {
		response.Data = json.RawMessage(data.(string))
	} else {
		response.Data = data
	}

	if nil != meta {
		response.Meta = meta
	} else {
		response.Meta = &sts.HttpMetaResponse{
			RecordsFiltered: 0,
			RecordsTotal:    0,
		}
	}

	return &response
}

func Message(data interface{}, args ...interface{}) *sts.HttpResponse {
	var response sts.HttpResponse

	if len(args) > 0 {
		response.Log = args[0]
	}
	response.Data = data
	return &response
}

func InternalErrorMessage(err error) *sts.HttpResponse {
	return &sts.HttpResponse{
		Data:          nil,
		InternalError: err,
	}
}

func StreamMessage(contentType string) *sts.HttpResponse {
	return &sts.HttpResponse{
		Data:        nil,
		ContentType: contentType,
	}
}

func EmptyMessage(log ...interface{}) *sts.HttpResponse {
	return Message(nil, log...)
}

func ErrorMessage(args ...interface{}) *sts.HttpResponse {
	var level, statusCode int
	var fields *[]sts.ValidateError
	var data interface{}

	code := locale.SomethingBadHappened
	message := locale.Messages[code]

	if _a := util.GetIntValue(args, 0); _a >= 2000 {
		code = _a
		if m, ok := locale.Messages[code]; ok {
			message = m
		}
	}

	if len(args) > 0 {
		if util.IsString(args[0]) {
			message = args[0].(string)
		} else if len(args) > 1 && util.IsString(args[1]) {
			message = args[1].(string)
		}

		if util.IsError(args[0]) {
			message = util.GetStringError(args[0])
		} else if len(args) > 1 && util.IsError(args[1]) {
			message = util.GetStringError(args[1])
		}

		if _b := util.GetIntValue(args, 0); _b >= 100 && _b <= 600 {
			statusCode = _b
		}

		if _b := util.GetIntValue(args, 1); _b >= 100 && _b <= 600 {

			statusCode = _b
		}

		if _b := util.GetIntValue(args, 1); _b <= 4 {
			level = _b
		}

		if _b := util.GetIntValue(args, 2); _b >= 100 && _b <= 600 {
			statusCode = _b
		}

		if _b := util.GetIntValue(args, 2); _b <= 4 {
			level = _b
		}
		if len(args) > 2 {
			statusCode = util.GetIntValue(args, 3)
		}

		if code == locale.ValidationError && len(args) > 1 {
			paramErrors := args[1].([]sts.ValidateError)
			//if reflect.TypeOf(args[1]).Kind() == reflect.Ptr {
			//	paramErrors = args[1].(*[]sts.ValidateError)
			//}
			fields = &paramErrors
		}

		if len(args) > 2 {
			data = args[2]
		}

		if code == locale.SQLErrorResponse || strings.HasPrefix(message, "mssql:") {
			msg,  sqlErrCode := constants.MatchError(message)
			code = sqlErrCode
			message = msg.Error()
		}

	}
	return &sts.HttpResponse{
		Error: &sts.HttpErrorResponse{
			Message:    fmt.Sprintf(`(#%d) %s`, code, message),
			Code:       code,
			Level:      level,
			StatusCode: statusCode,
			Fields:     fields,
			Data:       data,
		},
	}
}
