package mssql

import (
	"encoding/json"
	"fmt"
	"github.com/jmoiron/sqlx"
	"ns-api/common/utils"
	"ns-api/modules/log"
	"strconv"
	"strings"
)

// ----------------------
type columns struct {
	Name        string
	Type        string
	Length      string
	Default     interface{}
	Is_Computed interface{}
}
type Info struct {
	SourceName   string
	PrimaryKey   string
	ForeingKey   string
	Columns      []columns
	QueryCol     string
	Filter       string
	FilterParent string
}

type DetailInfo struct {
	Order int
	Name  string
	Value Info
}

type body struct {
	Header Info
	Detail []DetailInfo
}

type sm struct {
	StructMaintainer body   `json:"struct_maintainer"`
	ProcI            string `json:"proc_i"`
	ProcU            string `json:"proc_u"`
}

type sg struct { // struct suggest
	StructSuggest suggestStruct `json:"struct_suggest"`
}

type metaTable struct {
	Struct string      `json:"struct"`
	View   interface{} `json:"view"`
	Proc   interface{} `json:"proc,omitempty"`
}

// suggest
type suggestStruct struct {
	SourceName   string
	PrimaryKey   string
	Filter       string
	QueryCol     string
	IsCompany    int
	FilterParent string
}

func (conn *DatabaseConnection) InsertMnt(code,
	companyId string,
	dataBody map[string]interface{}) (rs string, err error) {
	var mdata []metaTable
	err = conn.SelectProcedure(&mdata, "GETMETATABLE_F", companyId, code)
	if err != nil {
		return
	}
	//FALTA
	var test sm
	err = json.Unmarshal([]byte(mdata[0].Struct), &test)
	if err != nil {
		return
	}
	if test.ProcI != "" {
		rs, err = conn.ExecJson(test.ProcI, companyId, utils.JsonString(dataBody))
		if err != nil {
			return
		}
		return
	}

	var fields, values string
	general := test
	fmt.Println(utils.JsonString(test))
	var fmFormat string
	for _, val := range general.StructMaintainer.Header.Columns {
		if val.Default == "" && val.Name != "id" && val.Is_Computed != true {
			fields = fields + "," + val.Name
			fmFormat = strings.Replace(fields, ",", "", 1)
			for key, v := range dataBody {
				if val.Name == key {
					if values != "" {
						values = fmt.Sprintf(`%v, '%v'`, values, v)
					} else {
						values = fmt.Sprintf("'%v'", v)
					}
				}
			}
		}
	}
	query := fmt.Sprintf(`
		INSERT INTO %v (%v)
		OUTPUT INSERTED.%v
		INTO @temptable(id)
		VALUES (%v);
	`,
		general.StructMaintainer.Header.SourceName,
		fmFormat,
		"id",
		// general.StructMaintainer.Header.PrimaryKey,
		values)
	fmt.Println(query)
	jsonData := "null"
	// fmt.Println("DETALLES", dataBody["detalles"])
	if nil != dataBody["detalles"] {
		cc := utils.JsonString(dataBody["detalles"])
		jsonData = cc
	}
	// -----------struct for detail --
	type mDetail struct {
		TypeDetail   string
		DataSelect   string
		FieldsDetail string
		SelectString string
	}
	var id *sqlx.Rows

	if "null" != jsonData && len(general.StructMaintainer.Detail) > 0 {

		allDetails := make(map[string]mDetail)

		for _, k := range general.StructMaintainer.Detail {
			tempPrimary := k.Value.ForeingKey
			var fieldsDetail, typeDetail, dataSelect string
			var generateSelect []string
			for _, val := range k.Value.Columns {
				// fmt.Println("COlumns", val, "LENG:", len(k.Value.Columns))
				if val.Default == "" && val.Name != k.Value.PrimaryKey {
					if val.Name != k.Value.PrimaryKey {
						typeDetail = fmt.Sprintf(`%v,%v %v%v`, typeDetail, val.Name, val.Type, val.Length)
						dataSelect = fmt.Sprintf(`%v,%v`, dataSelect, val.Name)
					}
					// fmt.Println("------------------", tempPrimary, val.Name)
					fieldsDetail = fieldsDetail + "," + val.Name
					if tempPrimary == val.Name {
						generateSelect = append(generateSelect, "@id")
					} else {
						generateSelect = append(generateSelect, val.Name)
					}

				}
			}
			val := mDetail{
				DataSelect:   k.Name,
				TypeDetail:   strings.Replace(typeDetail, ",", "", 1),
				FieldsDetail: strings.Replace(fieldsDetail, ",", "", 1),
				SelectString: strings.Join(generateSelect[:], ","),
			}
			allDetails[k.Name] = val
		}
		//ffd := strings.Replace(fieldsDetail, ",", "", 1) // Formated Fields Detail
		//ftd := strings.Replace(typeDetail, ",", "", 1)   //  ''  '' Detail
		var queryDetail string
		for _, val := range allDetails {
			//cad := strings.Split(val.FieldsDetail, ",")[1:]
			//fmt.Println("split",cad)
			//borrado := strings.Join(cad, ",")
			queryDetail = queryDetail + fmt.Sprintf(`
				 WITH cte_d AS(
				SELECT *
				FROM OPENJSON(@JSON,'$.%v')
				WITH(%v)
				)
				INSERT INTO %v(%v)
				SELECT %v
				FROM cte_d;
				`,
				strings.ToLower(val.DataSelect),
				val.TypeDetail, // ftd  allDetails["TMasd"].formatDETAIL
				val.DataSelect,
				val.FieldsDetail,
				val.SelectString,
				// ffd
			)
		}
		// ------------------------------
		transaction := fmt.Sprintf(`
	DECLARE @JSON NVARCHAR(MAX) = '%v'
	DECLARE @id int
	DECLARE @temptable table(id smallint)

	BEGIN TRANSACTION GUARDAR;
	BEGIN TRY
		SET NOCOUNT ON;
		%v
	SELECT @id = id FROM @temptable;
	IF @id is not null
		BEGIN;
			%v
	SELECT id FROM @temptable
	END
	IF @@TRANCOUNT <> 0
	BEGIN
		COMMIT TRANSACTION GUARDAR;
	END
	END TRY
	BEGIN CATCH
	ROLLBACK TRANSACTION GUARDAR;
	THROW
	END CATCH
	`,
			jsonData,
			query,
			//general.Header.SourceName,
			//general.Header.PrimaryKey,
			queryDetail)
		fmt.Println(transaction)
		id, err = conn.Queryx(transaction)
		if err != nil {
			return
		}

	} else {
		fmtQuery := fmt.Sprintf(`
			DECLARE @temptable table(id smallint)
			%v
			SELECT id FROM @temptable;`, query)
		id, err = conn.Queryx(fmtQuery)
		//log.Debug(fmtQuery)
		if err != nil {
			return
		}
	}

	var ResultID int
	for id.Next() {
		if err = id.Scan(&ResultID); err != nil {
			return
		}
	}
	rsString := strconv.Itoa(ResultID)
	rs = rsString
	return
}

func (conn *DatabaseConnection) PutMnt(code, companyId string, dataBody map[string]interface{}, id int) (err error) {
	var mdata []metaTable
	err = conn.SelectProcedure(&mdata, "GETMETATABLE_F", companyId, code)
	if err != nil {
		log.Debug(err)
		return
	}
	var test sm
	err = json.Unmarshal([]byte(mdata[0].Struct), &test)
	if err != nil {
		return
	}
	if test.ProcU != "" {
		_, err = conn.ExecJson(test.ProcU, companyId, id, utils.JsonString(dataBody))
		if err != nil {
			return
		}
		return
	}

	var fields string
	general := test
	count := 0
	for _, val := range general.StructMaintainer.Header.Columns {
		if val.Default == "" && val.Name != "id" && val.Is_Computed != true {
			for key, v := range dataBody {
				if key == val.Name && val.Name != "idempresa" {
					if count != 0 {
						fields = fmt.Sprintf(`%v, %v = '%v'`, fields, key, v)
					} else {
						fields = fmt.Sprintf(`%v = '%v'`, key, v)
					}
					count++
				}
			}
		}
	}
	query := fmt.Sprintf(`UPDATE %v SET %v WHERE %v = %v`,
		general.StructMaintainer.Header.SourceName,
		fields,
		general.StructMaintainer.Header.PrimaryKey,
		id)
	_, err = conn.Queryx(query)
	if err != nil {
		return
	}
	if len(general.StructMaintainer.Detail) > 0 {
		log.Debug("header con detail")
		// ------------------------MORE DETAILS
		// FIXME MESCLAR
		type mDetail struct {
			TypeDetail   string
			FieldsDetail string
			FieldSource  string
			SourceName   string
			Key          string
			Fkey         string
			UpdateSet    string
		}

		allDetails := make(map[string]mDetail)
		for _, k := range general.StructMaintainer.Detail {
			// variables temp
			var fieldsDetail, typeDetail, fieldSource, updateSet string
			for _, val := range k.Value.Columns {
				if val.Default == "" {
					if val.Name != "id" {
						fieldSource = fieldSource + fmt.Sprintf(`,[source].%v`, val.Name)
						fieldsDetail = fieldsDetail + "," + val.Name
						updateSet = fmt.Sprintf(`%v, [target].%v = [source].%v`, updateSet, val.Name, val.Name)

					}
					typeDetail = typeDetail + fmt.Sprintf(`,%v %v%v`, val.Name, val.Type, val.Length)
				}

			}
			val := mDetail{
				TypeDetail:   strings.Replace(typeDetail, ",", "", 1),
				FieldsDetail: strings.Replace(fieldsDetail, ",", "", 1),
				FieldSource:  strings.Replace(fieldSource, ",", "", 1),
				Key:          k.Value.PrimaryKey,
				Fkey:         k.Value.ForeingKey,
				SourceName:   k.Name,
				UpdateSet:    strings.Replace(updateSet, ",", "", 1),
			}
			allDetails[k.Name] = val
		}
		// todo id change
		var cc = dataBody["detalles"].(map[string]interface{})
		for _, val := range cc {
			var v = val.([]interface{})
			for _, k := range v {
				nf := k.(map[string]interface{})
				nf[general.StructMaintainer.Detail[0].Value.ForeingKey] = id //
			}
		}
		newDataJson := utils.JsonString(cc)
		// -----------------------------
		var query string
		for _, val := range allDetails {

			query = query + fmt.Sprintf(`
	

		WITH cte AS (SELECT * FROM OPENJSON(@JSON, '$.%v')
		WITH(%v))
		MERGE %v WITH(HOLDLOCK) AS [target]
		USING cte AS [source]
		ON [target].%v = [source].%v
		WHEN MATCHED THEN
		UPDATE SET
		%v
		WHEN NOT MATCHED BY TARGET THEN
		INSERT (%v) VALUES (%v)
		WHEN NOT MATCHED BY SOURCE AND 
		[target].%v = %v
		THEN DELETE;
		`,
				strings.ToLower(val.SourceName),
				val.TypeDetail,
				val.SourceName,
				val.Key,
				val.Key,
				val.UpdateSet,
				val.FieldsDetail,
				val.FieldSource,
				val.Fkey,
				id,
			)
		}

		finalQuery := fmt.Sprintf(`
		DECLARE @JSON NVARCHAR(MAX) = '%v';
		
		%v`, newDataJson, query)
		//log.Debug(finalQuery)
		_, err = conn.Queryx(finalQuery)
		if err != nil {
			log.Debug(err)
			return
		}

	}
	return
}

func (conn *DatabaseConnection) DeleteMnt(code, companyId string, id int) (err error) {
	var mdata []metaTable
	err = conn.SelectProcedure(&mdata, "GETMETATABLE_F", companyId, code)
	if err != nil {
		log.Debug(err)
		return
	}
	var test sm
	err = json.Unmarshal([]byte(mdata[0].Struct), &test)
	if err != nil {
		log.Debug(err)
		return
	}
	query := fmt.Sprintf(`DELETE FROM %v WHERE %v = '%v'`,
		test.StructMaintainer.Header.SourceName,
		test.StructMaintainer.Header.PrimaryKey,
		id)
	fmt.Println(utils.JsonString(test))
	fmt.Println(query)
	_, err = conn.Queryx(query)
	if err != nil {
		log.Debug(err)
		return
	}
	return
}

func (conn *DatabaseConnection) DisabledMnt(code, companyId string, id int) (err error) {
	var mdata []metaTable
	err = conn.SelectProcedure(&mdata, "GETMETATABLE_F", companyId, code)
	if err != nil {
		log.Debug(err)
		return
	}
	var test sm
	err = json.Unmarshal([]byte(mdata[0].Struct), &test)
	if err != nil {
		log.Debug(err)
		return
	}
	query := fmt.Sprintf(
		`UPDATE %v SET habilitado = 1^ habilitado WHERE %v = %v`,
		test.StructMaintainer.Header.SourceName,
		test.StructMaintainer.Header.PrimaryKey,
		id)
	_, err = conn.Queryx(query)
	if err != nil {
		log.Debug(err)
		return
	}
	return
}

func (conn *DatabaseConnection) SuggestAut(code,
	companyId string,
	search string,
	limit interface{},
	advanced int,
	advancedFilter string,
	filter interface{}) (query string, proc int, err error) {
	var mdata []metaTable
	err = conn.SelectProcedure(&mdata, "GETMETATABLE_F", companyId, code)
	if err != nil {
		return
	}
	if mdata[0].Proc != nil {
		query = mdata[0].Proc.(string)
		proc = 1
		return
	}
	//FALTA
	var test sg
	err = json.Unmarshal([]byte(mdata[0].Struct), &test)
	if err != nil {
		//fmt.Println(err)
		return
	}
	general := test

	var filterAdvanced string
	if advancedFilter != "" {
		filterAdvanced = fmt.Sprintf(`SET @advanced_filter = '%v'`, advancedFilter)
	}

	var searchSet string
	if search != "" || search != " " {
		searchSet = fmt.Sprintf(`SET @search = LTRIM('%v')`, search)
	}

	var filterParet string
	if filter != nil {
		//filterParet = fmt.Sprintf(` %v = %v AND `, general.StructMaintainer.Header.FilterParent, filter)
		filterParet = fmt.Sprintf(` %v = %v AND `, general.StructSuggest.FilterParent, filter)
	}

	var where string
	for _, v := range strings.Split(general.StructSuggest.Filter, ",") {
		where = where + fmt.Sprintf(`	OR (%v LIKE '''+ char(37)+ ''' + @search + '''+ char(37)+ ''') `, v)
	}
	var idEmpresa string
	if general.StructSuggest.IsCompany == 1 {
		idEmpresa = " idempresa = @idempresa AND "
	}
	qr := fmt.Sprintf(`
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
		companyId,
		limit,
		advanced,
		filterAdvanced,
		searchSet,
		general.StructSuggest.QueryCol,
		general.StructSuggest.SourceName,
		idEmpresa,
		filterParet,
		where,
	)
	query = qr
	proc = 0
	return
}

type metadata struct {
	Metadata *string
}
type fm struct {
	StructList bodyList `json:"struct_list"`
}
type bodyList struct {
	SourceName      string
	PrimaryKey      string
	QueryCol        string
	Filter          string
	Filter_advanced string
}

func (conn *DatabaseConnection) GetList(corpid string,
	size,
	page,
	search,
	sort interface{},
	data,
	cid string) (result interface{}, meta *HttpMetaResponse, err error) {

	var mdata []metadata
	err = conn.SelectProcedure(&mdata, "GETMETALIST_F", corpid, cid) // fixme complete
	if err != nil {
		return
	}
	nf := mdata[0].Metadata
	if nf == nil {
		err  = fmt.Errorf("no metadata available")
		return
	}
	var formatData fm
	err = json.Unmarshal([]byte(*nf), &formatData)
	if err != nil {
		return
	}
	fmt.Println(utils.JsonString(formatData))
	query := fmt.Sprintf(`
	DECLARE 
	@SQLString nvarchar(MAX),
	@idempresa smallint = '%v',
    @size smallint = %v,
    @page smallint = %v,
    @search nvarchar(max) = '%v',
    @order varchar(max) = '%v',
    @advanced_filter varchar(max) = '%v';
	SET NOCOUNT ON
	BEGIN
    SET @SQLString = N'
            SET @search = @search + ''%v'';
            WITH table_data AS (
                SELECT %v FROM %v'
         IF @advanced_filter = '' OR @advanced_filter = '{}' 
            BEGIN
                SET @SQLString = @SQLString + ' WHERE %v '
            END
        ELSE 
            BEGIN
                SET @SQLString = @SQLString + ' WHERE ' + ISNULL(STUFF((SELECT ', '+ [key] + operator + value
                FROM OPENJSON(@advanced_filter)
                WITH([key] varchar(100), value varchar(100),operator varchar(5)) 
                FOR XML PATH('')), 1, 2, ''), '') 
            END
         SET @SQLString = @SQLString  + ' ), table_total AS (
            SELECT COUNT(*) AS pg_TotalRows FROM table_data
        )
        SELECT
            *,
            (SELECT COUNT(*) FROM table_data) AS pg_totalFiltered
        FROM table_data, table_total
        ORDER BY ' + ISNULL(STUFF((SELECT ', '+ TRIM([column]) +' '+ TRIM(dir)
                FROM OPENJSON(@order)
                WITH([column] varchar(50), dir char(4))
                --ORDER BY [column] ASC
        FOR XML PATH('')), 1, 2, ''), '1 ASC') + '
        OFFSET @page ROWS
        FETCH NEXT @size ROWS ONLY';
    DECLARE @params nvarchar(max)= N'@search varchar(max), @page smallint, @size smallint, @order varchar(max),@advanced_filter varchar(max), @idempresa smallint';
    EXEC sp_executesql @SQLString, @params, @search, @page, @size, @order,@advanced_filter,@idempresa;
	END
`, corpid,
		size,
		page,
		search,
		sort,
		data,
		"%",
		formatData.StructList.QueryCol,
		formatData.StructList.SourceName,
		formatData.StructList.Filter)

	fmt.Println("Error por aqui ", query)

	rows, err := conn.Queryx(query)
	if err != nil {
		log.Debug(err)
		return
	}
	defer rows.Close()
	tableData, totalFiltered, totalRows, err := GetMetadata(rows)
	if err != nil {
		log.Debug(err)
		return
	}
	return tableData, &HttpMetaResponse{RecordsFiltered: totalFiltered, RecordsTotal: totalRows}, nil
}
