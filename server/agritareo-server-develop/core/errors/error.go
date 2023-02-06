package errors

import (
	"fmt"
	mssql "github.com/denisenkom/go-mssqldb"
	"strings"
)

//type ECode int
type EType uint16

const (
	ErrorTypeInternal EType = 0 + iota
	ErrorTypeMssql
	ErrorTypeHttp
)

type Error struct {
	Code     int
	Message  string
	Type     EType
	Severity uint8

	CorrectiveAction string
	Cause            uint16
	ProcName         string
	LineNo           int32
}

func (e *Error) Error() string {
	message := e.Message

	if 0 != e.Code && !strings.HasPrefix(message, "(#") {
		message = fmt.Sprintf(`(#%d) %s`, e.Code, message) // "(#" + e.Code + ") " + message
	}

	return message
}

//func (e ECode) String() string {
//	return strconv.Itoa(int(e))
//}

// Type...
// ([error|code|message], ?[error|message|severity], ?[severity|type])

func NewError(args ...interface{}) error {

	err := &Error{
		Type: ErrorTypeInternal,
	}

	if 0 < len(args) {
		arg0 := args[0]

		switch arg0.(type) {
		case string:
			err.Message = arg0.(string)
		case int:
			err.Code = arg0.(int)
		case mssql.Error:
			mssqlError := arg0.(mssql.Error)
			err.Code = int(mssqlError.Number)
			err.Message = mssqlError.Message
			err.Type = ErrorTypeMssql
			err.ProcName = mssqlError.ProcName
			err.LineNo = mssqlError.LineNo
		case *Error:
			val := arg0.(*Error)
			err.Code = val.Code

			if 0 < err.Code {
				err.Type = ErrorTypeHttp
			}

			err.Message = val.Message
			err.Severity = val.Severity
			err.CorrectiveAction = val.CorrectiveAction
			err.Cause = val.Cause
			err.ProcName = val.ProcName
			err.LineNo = val.LineNo

		case error:
			err.Message = arg0.(error).Error()
		}

		if 1 < len(args) {
			arg1 := args[1]

			switch arg1.(type) {
			case string:
				err.Message = arg1.(string)
			case int:
				err.Severity = uint8(arg1.(int))
			case *Error:
				val := arg1.(*Error)
				err.Code = val.Code

				if 0 < err.Code {
					err.Type = ErrorTypeHttp
				}

				err.Message = val.Message
				err.Severity = val.Severity
				err.CorrectiveAction = val.CorrectiveAction
				err.Cause = val.Cause
				err.ProcName = val.ProcName
				err.LineNo = val.LineNo
			case error:
				err.Message = arg1.(error).Error()
			}
		}
	}

	return err
}
