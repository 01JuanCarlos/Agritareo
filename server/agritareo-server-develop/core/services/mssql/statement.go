package mssql

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/mitchellh/mapstructure"
	"ns-api/config"
	errors2 "ns-api/core/errors"
	"ns-api/modules/log"
	"regexp"
	"strings"
)

type pageInformation struct {
	TotalFiltered int64
	TotalRows     int64
	Data          interface{}
}

type execResult struct {
	Query  string
	Result []map[string]interface{}
}

func (er *execResult) String() string {
	result, _ := json.Marshal(er.Result)
	return string(result)
}

func (er *execResult) Map() []map[string]interface{} {
	return er.Result
}

func (er *execResult) Unmarshal(dest interface{}) error {
	c := &mapstructure.DecoderConfig{
		TagName: "json",
		Result:  dest,
	}

	decoder, err := mapstructure.NewDecoder(c)

	if nil != err {
		return err
	}

	return decoder.Decode(er.Result)
}

////

func ParseProcedureName(procedureName string) string {
	return fmt.Sprintf(`EXEC [%s].[%s_%s]`, config.MssqlSchema, config.MssqlPrefix, procedureName)
}

func (conn *DatabaseConnection) QueryWithContext(query string, args ...interface{}) (*sqlx.Rows, error) {
	ctx, _ := context.WithTimeout(context.Background(), config.MssqlMaxQueryDuration)
	rows, err := conn.connection.QueryxContext(ctx, query, args...)
	if nil != err {
		return nil, errors2.NewError(err)
	}
	return rows, nil
}

func (conn *DatabaseConnection) QueryRowContext(query string, args ...interface{}) *sql.Row {
	ctx, _ := context.WithTimeout(context.Background(), config.MssqlMaxQueryDuration)
	return conn.connection.QueryRowContext(ctx, query, args...)
}

func (conn *DatabaseConnection) Exec(query string, args ...interface{}) (*execResult, error) {
	var sArgs string

	for i := range args {
		sArgs += fmt.Sprintf(`$%d,`, i+1)
	}

	queryLog := query
	log.Debug(queryLog)
	sArgs = strings.TrimSuffix(sArgs, ",")

	re := regexp.MustCompile(`^\w+$`)

	if re.Match([]byte(query)) {
		queryLog = ParseProcedureName(query)
		query = fmt.Sprintf(`%s %s`, ParseProcedureName(query), sArgs)
	}

	log.Infof("Exec Query: "+queryLog+" "+strings.TrimSuffix(strings.Repeat("%#v,", len(args)), ","), args...)

	rows, err := conn.QueryWithContext(query, args...)

	if nil != err {
		return nil, err
	}

	defer func() {
		_ = rows.Close()
	}()

	var result []map[string]interface{}

	for rows.Rows.Next() {
		row := make(map[string]interface{})
		if err := rows.MapScan(row); nil == err {
			for k, v := range row {
				if config.TransactionIdKey == k {
					if u, ok := row[k].([]byte); ok {
						row[k] = DecodeUUID(u)
					}
				} else {
					var _objCol interface{}
					var _arrCol []interface{}

					isJsonArray := strings.HasSuffix(k, "$$")
					isJsonObject := !isJsonArray && strings.HasSuffix(k, "$")

					if s, o := v.(string); nil != v && o {
						if isJsonArray {
							if err := json.Unmarshal([]byte(s), &_arrCol); nil == err {
								row[k[:len(k)-2]] = _arrCol
							}
						} else if isJsonObject {
							_ = json.Unmarshal([]byte(s), &_objCol)
						}
					}

					if isJsonArray && nil == _arrCol {
						row[k[:len(k)-2]] = make([]map[string]interface{}, 0)
					} else if isJsonObject {
						row[k[:len(k)-1]] = _objCol
					}

					if isJsonArray || isJsonObject {
						delete(row, k)
					}

				}
			}

			result = append(result, row)
		}
	}

	return &execResult{
		Query:  queryLog,
		Result: result,
	}, nil
}

func (conn *DatabaseConnection) Begin() (*sql.Tx, error) {
	return conn.connection.Begin()
}

func (conn *DatabaseConnection) Page(query string, args ...interface{}) (*pageInformation, error) {
	var totalFiltered, totalRows int64
	result, err := conn.Exec(query, args...)

	if nil != err {
		return nil, err
	}

	rows := result.Map()

	if 0 < len(rows) {
		totalFiltered = rows[0]["pg_totalFiltered"].(int64)
		totalRows = rows[0]["pg_TotalRows"].(int64)

		for i := 0; i < len(rows); i++ {
			delete(rows[i], "pg_totalFiltered")
			delete(rows[i], "pg_TotalRows")
		}
	}

	return &pageInformation{
		TotalFiltered: totalFiltered,
		TotalRows:     totalRows,
		Data:          rows,
	}, nil
}

///

// Deprecated: La validación se realiza en el middleware
func isValidConnection(conn *DatabaseConnection) bool {
	if nil == conn {
		return false
	}

	if !conn.IsConnected() {
		_, err := conn.Connect()
		if nil != err {
			return false
		}
	}
	return true
}

// Refactor error...
func (conn *DatabaseConnection) Query(query string, args ...interface{}) (*sql.Rows, error) {
	return Query(conn, query, args...)
}

func Query(conn *DatabaseConnection, query string, args ...interface{}) (*sql.Rows, error) {
	if !isValidConnection(conn) {
		return nil, errors.New("Query[CheckConnection] Error ")
	}
	return conn.connection.Query(query, args...)
}

//

func (conn *DatabaseConnection) Select(dest interface{}, query string, args ...interface{}) error {
	return Select(conn, dest, query, args...)
}

func Select(conn *DatabaseConnection, dest interface{}, query string, args ...interface{}) error {
	if !isValidConnection(conn) {
		return errors.New("Select[CheckConnection] Error ")
	}
	return conn.connection.Select(dest, query, args...)
}

//

func (conn *DatabaseConnection) Get(dest interface{}, query string, args ...interface{}) error {
	return Get(conn, dest, query, args...)
}

func Get(conn *DatabaseConnection, dest interface{}, query string, args ...interface{}) error {
	if !isValidConnection(conn) {
		return errors.New("Get[CheckConnection] Error ")
	}
	return conn.connection.Get(dest, query, args...)
}

//

func (conn *DatabaseConnection) Queryx(query string, args ...interface{}) (*sqlx.Rows, error) {
	return Queryx(conn, query, args...)
}

func Queryx(conn *DatabaseConnection, query string, args ...interface{}) (*sqlx.Rows, error) {
	if !isValidConnection(conn) {
		return nil, errors.New("Queryx[CheckConnection] Error ")
	}
	return conn.connection.Queryx(query, args...)
}

//

func (conn *DatabaseConnection) NamedExec(query string, arg interface{}) (sql.Result, error) {
	return NamedExec(conn, query, arg)
}

func NamedExec(conn *DatabaseConnection, query string, arg interface{}) (sql.Result, error) {
	if !isValidConnection(conn) {
		return nil, errors.New("NamedExec[CheckConnection] Error ")
	}
	return conn.connection.NamedExec(query, arg)
}

//

func (conn *DatabaseConnection) NamedQuery(query string, arg interface{}) (*sqlx.Rows, error) {
	return NamedQuery(conn, query, arg)
}

func NamedQuery(conn *DatabaseConnection, query string, arg interface{}) (*sqlx.Rows, error) {
	if !isValidConnection(conn) {
		return nil, errors.New("NamedQuery[CheckConnection] Error ")
	}
	return conn.connection.NamedQuery(query, arg)
}

//

func (conn *DatabaseConnection) MustExec(query string, args ...interface{}) sql.Result {
	return MustExec(conn, query, args...)
}

func MustExec(conn *DatabaseConnection, query string, args ...interface{}) sql.Result {
	return conn.connection.MustExec(query, args...)
}
