package locale

const (
	SomethingBadHappened int = iota + 2e3
	MissingFields
	TryAgainLater
	InvalidLogIn
	FormatNotFound
	DocumentNotFound
	InvalidSession
	InvalidPassword
	ProcedureNameNotFound
	ValidationError
	SQLErrorResponse
	RecordAlreadyExists
	FieldLimitExceeded
	TypeConversionError
	ParametersLimitExceeded
	NullFields
	ProcedureDoesNotExis // similar =  ProcedureNameNotFound
	InsufficientValues
	WrongTransactionSyntax
	ValueLimitExceeded
	ComponentNotFound
	InvalidName
	ConflictColumn // fix
	InvalidDateConversion
	InvalidColumn
	InsertionError
	ReferencedData
	ParametersNotSupplied
)

type localLanguages map[string]string

var Messages map[int]string

func init() {
	Messages = map[int]string{
		SomethingBadHappened:  "Something bad happened :(",
		MissingFields:         "Missing Fields",
		TryAgainLater:         "Try again later",
		InvalidLogIn:          "Incorrect username or password",
		FormatNotFound:        "There is no format for this Component",
		InvalidSession:        "It is not possible to renew the session",
		InvalidPassword:       "Invalid Password",
		ProcedureNameNotFound: "Proc not found",
		ValidationError:       "Field validation failed",
		DocumentNotFound:      "There are no documents associated with this form",
		SQLErrorResponse:      Messages[TryAgainLater],
	}
}

func SetMessage(code int, text, lang string) {

}

func GetMessage(code int) string {
	message, ok := Messages[code]

	if !ok {
		return Messages[SomethingBadHappened]
	}

	return message
}
