package mssql

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/jmoiron/sqlx"
	"ns-api/config"
	"ns-api/modules/log"
	"strings"
	"time"
)

// todo: HttpMetaResponse, retornar un mapa y castear el resultado en el llamado de la funcion
type HttpMetaResponse struct {
	RecordsFiltered int64  `json:"recordsFiltered"`
	RecordsTotal    int64  `json:"recordsTotal"`
	ProcedureData   string `json:"dataId,omitempty"`
}

func (conn *DatabaseConnection) ExecJson(name string, args ...interface{}) (result string, err error) {
	data, err := conn.exec(name, args...)


	if nil != err {
		log.Errorf("ExecJson[NS_%s] %s", name, err.Error())
		return
	}

	defer data.Close()

	// Concat string result
	for data.Next() {
		var line string
		errScan := data.Scan(&line)
		if nil == errScan {
			result += line
		}
	}
	return
}

func (conn *DatabaseConnection) exec(name string, args ...interface{}) (*sqlx.Rows, error) {
	var stringArgs string

	for i := range args {
		stringArgs += fmt.Sprintf(`$%d,`, i+1)
	}

	query := fmt.Sprintf(`EXEC %s_%s %s`, config.MssqlPrefix, name, strings.TrimSuffix(stringArgs, ","))
	log.Infof("CALLING PROCEDURE: %s_%s %v", config.MssqlPrefix, name, args)

	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second) // 30 segundos maximo de espera.
	return conn.connection.QueryxContext(ctx, query, args...)
}

func (conn *DatabaseConnection) execWithOutContext(name string, args ...interface{}) (*sqlx.Rows, error) {
	var stringArgs string

	for i := range args {
		stringArgs += fmt.Sprintf(`$%d,`, i+1)
	}

	query := fmt.Sprintf(`EXEC %s_%s %s`, config.MssqlPrefix, name, strings.TrimSuffix(stringArgs, ","))
	log.Infof("CALLING PROCEDURE: %s_%s %v", config.MssqlPrefix, name, args)
	return conn.connection.Queryx(query, args...)
}

func GetMetadata(rows *sqlx.Rows) (tableDataF interface{}, totalFiltered, totalRows int64, err error) {
	columns, err := rows.Columns()
	if err != nil {
		return
	}
	count := len(columns)
	tableData := make([]map[string]interface{}, 0)
	values := make([]interface{}, count)
	valuePtrs := make([]interface{}, count)
	totalFiltered = int64(0)
	totalRows = int64(0)

	for rows.Next() {
		for i := 0; i < count; i++ {
			valuePtrs[i] = &values[i]
		}
		_ = rows.Scan(valuePtrs...)
		entry := make(map[string]interface{})
		for i, col := range columns {
			val := values[i]
			if "pg_TotalRows" == col || "pg_totalFiltered" == col {
				if "pg_totalFiltered" == col {
					totalFiltered = val.(int64)
				} else {
					totalRows = val.(int64)
				}
			} else {
				b, ok := val.([]byte)
				if ok {
					entry[col] = string(b)
				} else {
					var _objCol interface{}
					var _arrCol []interface{}

					if strings.HasSuffix(col, "$$") && nil != val {
						_ = json.Unmarshal([]byte(val.(string)), &_arrCol)
						entry[col[:len(col)-2]] = _arrCol
					} else if strings.HasSuffix(col, "$") && nil != val {
						_ = json.Unmarshal([]byte(val.(string)), &_objCol)
						entry[col[:len(col)-1]] = _objCol
					} else {
						entry[col] = val
					}
				}
			}

		}
		tableData = append(tableData, entry)
	}
	tableDataF = tableData
	return
}

func (conn *DatabaseConnection) Pagination(name string, args ...interface{}) (data interface{}, meta *HttpMetaResponse, err error) {
	rows, err := conn.exec(name, args...)
	if nil != err {
		return
	}
	defer rows.Close()
	//  GetMetaData
	tableData, totalFiltered, totalRows, err := GetMetadata(rows)
	if err != nil {
		return
	}
	return tableData, &HttpMetaResponse{RecordsFiltered: totalFiltered, RecordsTotal: totalRows}, nil
}

func (conn *DatabaseConnection) Find(name string, args ...interface{}) (data interface{}, meta *HttpMetaResponse, err error) {
	rows, err := conn.exec(name, args...)
	if nil != err {
		return
	}
	defer rows.Close()
	//  GetMetaData
	tableData, _, _, err := GetMetadata(rows)
	if err != nil {
		return
	}
	return tableData, nil, nil
}
