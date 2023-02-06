package errors

import (
	"ns-api/locale"
)

var (
	SomethingBadHappenedError = NewError(locale.SomethingBadHappened)
	TryAgainLaterError        = NewError(locale.TryAgainLater)
	ValidationError           = NewError(locale.ValidationError)
	MissingFieldsError        = NewError(locale.MissingFields)
)
