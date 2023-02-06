package maintainerBusiness

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"ns-api/common/constants"
	"ns-api/common/logger"
	"ns-api/core/services/mssql"
	"ns-api/core/sts"
	"strings"
)

// Struct declaration

type rsQuery struct {
	Proc  string
	Query string
}

//

type HeadersSt struct {
	Field  string `json:"campo"`
	Type   string `json:"tipo"`
	Column int    `json:"columna"`
}

// Private functions declaration
func (rp *repository) getQuerySg(us *sts.Client, cid, search interface{}, advancedFilter string, limit interface{}, advanced int, idParent interface{}) (rs rsQuery) {
	var stSuggest StSuggest
	var filterAdvanced, searchSet, filterParet, where, idEmpresa string
	var res rsQuery
	stMant := rp.StManteiner(us, cid)
	if len(stMant) == 0 {
		return
	}
	err := json.Unmarshal([]byte(stMant[0].Struct), &stSuggest)
	if err != nil {
		logger.Error("Error getQuery ---> ", err)
		return
	}
	if stMant[0].Proc != nil {
		fmt.Println("HAY DATA", stMant[0].Proc)
		res.Proc = stMant[0].Proc.(string)
		return res
	}
	filterAdvanced = fmt.Sprintf(`SET @advanced_filter = '%v'`, advancedFilter)
	searchSet = fmt.Sprintf(`SET @search = LTRIM('%v')`, search)
	if idParent != nil {
		filterParet = fmt.Sprintf(` %v = %v AND `, stSuggest.StructSuggest.FilterParent, idParent)
	}
	for _, v := range strings.Split(stSuggest.StructSuggest.Filter, ",") {
		where = where + fmt.Sprintf(`	OR (%v LIKE '''+ char(37)+ ''' + @search + '''+ char(37)+ ''') `, v)
	}
	if stSuggest.StructSuggest.IsCompany == 1 {
		idEmpresa = " idempresa = @idempresa AND "
	}
	res.Query = fmt.Sprintf(`
		DECLARE @idempresa smallint = %v,
		@search	varchar(200),
		@limit tinyint = %v,
		@advanced bit = %v,
		@advanced_filter varchar(max) ;

		%v
		%v

		IF @advanced = 0
			SET @search = LTRIM(@search) + ''+ char(37)+ ''

		DECLARE @SQLString nvarchar(max) = '

		WITH cte (id,code, label, [description]) AS (
			SELECT ' +
				CASE WHEN @advanced = 1 AND LEN(RTRIM(RTRIM(ISNULL(@advanced_filter, '')))) = 0 THEN 'TOP 0' ELSE ' ' END + '
				%v
			FROM %v ' +
			CASE WHEN @advanced = 0 THEN '
					WHERE %v %v (@search = ''""'' %v)' ELSE ' ' END +
		')

		SELECT *
		FROM cte '+ CASE WHEN @advanced = 1 AND LEN(RTRIM(RTRIM(ISNULL(@advanced_filter, '')))) <> 0 THEN CONCAT('WHERE ', @advanced_filter) ELSE ' ' END +'
		ORDER BY id
		OFFSET 0 ROWS FETCH NEXT ISNULL(@limit, 10) ROWS ONLY;'

		DECLARE @params nvarchar(max)= N'@idempresa smallint, @search varchar(200), @limit tinyint'
		EXEC sp_executesql @SQLString, @params, @idempresa, @search, @limit;
		`,
		us.CompanyId,
		limit,
		advanced,
		filterAdvanced,
		searchSet,
		stSuggest.StructSuggest.QueryCol,
		stSuggest.StructSuggest.SourceName,
		idEmpresa,
		filterParet,
		where,
	)
	return res
}

func getRowsTable(query string, db *mssql.DatabaseConnection) (result []HeadersSt, err error) {
	rows, err := db.Queryx(query)
	if err != nil {
		logger.Error("Error getRowsTable ---> ", err)
		return result, err
	}
	ctt, _ := rows.ColumnTypes()
	for i, ct := range ctt {
		var name string
		// ------- Campos Mssql
		switch ct.DatabaseTypeName() {
		case "VARCHAR":
			name = "string"
		case "INT", "SMALLINT", "REAL", "FLOAT", "DECIMAL":
			name = "number"
		case "BIT":
			name = "boolean"
		case "DATETIME":
			name = "date"
		default:
			name = ct.DatabaseTypeName()
		}
		// ----------
		result = append(result, HeadersSt{Field: ct.Name(), Type: name, Column: i})
	}
	return
}

// Public functions declaration
func (rp *repository) AutoExecSg(us *sts.Client, cid, search, limit interface{}, advancedFilter string, advanced int, idParent interface{}) (rs interface{}, rsHeader []HeadersSt, err error) {
	var queryExec, afQuery, valueColumn string // advancedFilter to Query
	filtrox := map[string]string{
		"1": "=",
		"2": "IN",
		"3": "<>",
		"4": "LIKE",
		"5": ">",
		"6": "<",
	}
	resQuery := rp.getQuerySg(us, cid, search, afQuery, limit, advanced, idParent)
	if resQuery.Proc != "" {
		if idParent == nil {
			idParent = ""
		}
		queryExec = fmt.Sprintf(`EXEC NS_%v%v '%v','%v','%v',%v, '%v'`,
			resQuery.Proc,
			constants.PGetSuggest,
			us.CompanyId,
			search,
			limit,
			advanced,
			idParent,
			) // se cambio pal agribug
		logger.Debug(queryExec)
		result, err := us.Sql.Queryx(queryExec)
		if err != nil {
			return rs, rsHeader, err
		}
		tb := make([]map[string]interface{}, 0)
		for result.Next() {
			ss := make(map[string]interface{})
			err = result.MapScan(ss)
			if err != nil {
				return rs, rsHeader, err
			}
			tb = append(tb, ss)
		}
		return tb , rsHeader, err
	} else {
		queryExec = resQuery.Query
	}
	rsHeader, err = getRowsTable(queryExec, us.Sql)
	if err != nil {
		return rs, rsHeader, err
	}
	if advanced != 0 && advancedFilter == "" {
		return rs, rsHeader, err
	}
	if advancedFilter != "" {
		decode, _ := base64.URLEncoding.DecodeString(advancedFilter)
		var af []map[string]interface{}
		err = json.Unmarshal(decode, &af)
		if err != nil {
			return rs, rsHeader, err
		}
		for _, i := range af {
			var query = ""
			filter, ok := filtrox[i["filter"].(string)]
			if !ok {
				filter = i["filter"].(string)
			}
			for _, value := range rsHeader {
				if value.Column == int(i["column"].(float64)) {
					valueColumn = value.Field
				}
			}
			if i["filter"].(string) == "4"{
				query = fmt.Sprintf(`AND %v %v (''%v'') `, valueColumn, filter, i["value"])
			} else {
				query = fmt.Sprintf(`AND %v %v (''%v'') `, valueColumn, filter, i["value"])

			}
			afQuery = afQuery + query
		}

		afQuery = strings.Replace(afQuery, "AND ", "", 1)

		if resQuery.Proc == "" {
			queryExec = strings.Replace(queryExec, "SET @advanced_filter = ''", "SET @advanced_filter = ' "+afQuery+" '", -1)
		} else {
			queryExec = fmt.Sprintf(`EXEC NS_%v%v '%v','%v','%v',%v,'%v','%v'`,
				resQuery.Proc,
				constants.PGetSuggest,
				us.CompanyId,
				search,
				limit,
				advanced,
				afQuery,
				idParent)

		}
	}
	result, err := us.Sql.Queryx(queryExec)
	logger.Info("queryExec--->", queryExec)
	if err != nil {
		return rs, rsHeader, err
	}
	tb := make([]map[string]interface{}, 0)
	for result.Next() {
		ss := make(map[string]interface{})
		err = result.MapScan(ss)
		if err != nil {
			return rs, rsHeader, err
		}
		tb = append(tb, ss)
	}
	if advanced == 0 {
		jsonBody, err := json.Marshal(tb)
		if err != nil {
			return rs, rsHeader, err
		}
		var suggest []Suggest
		if err := json.Unmarshal(jsonBody, &suggest); err != nil {
			return rs, rsHeader, err
		}
		return suggest, rsHeader, err
	}
	return tb, rsHeader, err
}

