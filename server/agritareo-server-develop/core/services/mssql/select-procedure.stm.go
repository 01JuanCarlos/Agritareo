package mssql

import (
	"fmt"
	"ns-api/config"
	"ns-api/modules/log"
	"strings"
)

func (conn *DatabaseConnection) SelectProcedure(dest interface{}, name string, args ...interface{}) error {
	var stringArgs string

	for i := range args {
		fieldType := fmt.Sprintf("%T", args[i])
		if fieldType == "string" {
			stringArgs += fmt.Sprintf(`'%v',`, args[i])
		} else if "<nil>" == fieldType {
			stringArgs += fmt.Sprintf(`NULL,`)
		} else {
			stringArgs += fmt.Sprintf(`%v,`, args[i])
		}
	}

	query := fmt.Sprintf(`EXEC %s_%s %s`, config.MssqlPrefix, name, strings.TrimSuffix(stringArgs, ","))

	log.Debug(query)
	err := conn.Select(dest, query)

	if err != nil {
		log.Errorf("Database %s ", err.Error())
		return err
	}
	return nil
}