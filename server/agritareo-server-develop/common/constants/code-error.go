package constants

import (
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

var errorNames = map[string]string{
	"1001": "Violation of UNIQUE KEY constraint",
	"1002": "String or binary data would be truncated",
	"1003": "Conversion failed when converting",
	"1004": "has too many arguments specified",
	"1005": "Cannot insert duplicate key row in object",
	"1006": "conflicted with the FOREIGN KEY constraint",
	"1007": "Could not find stored procedure",
	"1008": "There are more columns in the INSERT",
	"1009": "Incorrect syntax near",
	"1010": "statement contains more items than the insert list",
	"1011": "No existe este componente",
	"1012": "Cannot insert the value NULL into column",
	"1013": "Invalid object name",
	"1014": "The UPDATE statement conflicted with the CHECK constraint",
	"1015": "datetime data type resulted in an out-of-range value",
	"1016": "Invalid column name",
	"1017": "FOREIGN KEY SAME TABLE",
	"1018": "conflicted with the REFERENCE",
	"1019": "which was not supplied",
	"1020": "Error converting data type",
}

var test = map[string]string{
	"1001": "el registro ya existe.",
	"1002": "field limit exceeded.",
	"1003": "type conversion error. value:",
	"1004": "parameter limit exceeded.",
	"1005": "duplicate record.",
	"1006": "null field. value:",
	"1007": "requested procedure does not exist.",
	"1008": "sent values are insufficient.",
	"1009": "incorrect syntax transaction.",
	"1010": "sent values exceed the limit.",
	"1011": "this component does not exist.",
	"1012": "complete the field. value:",
	"1013": "invalid name. value:",
	"1014": "conflicted with column:",
	"1015": "invalid date conversion.",
	"1016": "invalid column. value:",
	"1017": "insertion error. column:",
	"1018": "the data is referenced in other tables. value:",
	"1019": "parameters not supplied. value:",
	"1020": "type conversion error.",
}

func MatchError(error string) (msg error, code int) {
	for i, rs := range errorNames {
		ok := strings.Contains(error, rs)
		if ok {
			var search string
			if strings.HasSuffix(test[i], "value:") {
				search = `\'.*?\'`
			} else {
				search = `\(.*?\)`
			}
			re := regexp.MustCompile(search)
			field := re.FindStringSubmatch(error)
			if len(field) > 0 {
				msg = errors.New(fmt.Sprintf(`%v %v`, test[i], field[0]))
			} else {
				msg = errors.New(fmt.Sprintf(`%v`, test[i]))
			}
			code, _ = strconv.Atoi(i)
			return
		}
	}
	msg = errors.New("something bad happened 😱")
	code = 1000
	return
}
