package utils

import (
	"fmt"
	"strings"
)

func FormatFromFields(fields string, values ...interface{}) string {
	var format string
	var fieldValue interface{}

	splitFields := strings.Split(fields, ",")

	for i, field := range splitFields {
		param := strings.TrimSpace(field)
		if strings.HasPrefix(param, "@") {
			format += param + ","
		} else {
			if len(values)-1 < i {
				fieldValue = ""
			} else {
				fieldValue = values[i]
			}

			fieldType := fmt.Sprintf("%T", fieldValue)
			format += "@" + param + "="

			if fieldType == "string" {
				format += "'%v',"
			} else {
				format += "%v,"
			}
		}
	}
	return strings.TrimSuffix(format, ",")
}
