package maintainerBusiness

import (
	"encoding/json"
	"fmt"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/core/sts"
	"strconv"
	"strings"
)

// Struct declaration
type mDetail struct {
	TypeDetail   string
	DataSelect   string
	FieldsDetail string
	SelectString string
}

// Private functions declaration
func (rp *repository) getQueryIns(us *sts.Client, cid interface{}, stMaintainer StMaintainer, dataBody map[string]interface{}) (rs string, err error) {
	var queryDetail string
	fmFormat, values := rp.GetColumnsValues(stMaintainer.StructMaintainer.Header.Columns, dataBody)
	rs = fmt.Sprintf(`
		INSERT INTO %v (%v)
		OUTPUT INSERTED.%v
		INTO @temptable(id)
		VALUES (%v); `,
		stMaintainer.StructMaintainer.Header.SourceName,
		fmFormat,
		"id",
		values)
	jsonData := "null"
	if nil != dataBody["detalles"] {
		cc := utils.JsonString(dataBody["detalles"])
		jsonData = cc
	}
	if "null" != jsonData && len(stMaintainer.StructMaintainer.Detail) > 0 {
		allDetails := make(map[string]mDetail)
		for _, k := range stMaintainer.StructMaintainer.Detail {
			tempPrimary := k.Value.ForeignKey
			var fieldsDetail, typeDetail, dataSelect string
			var generateSelect []string
			for _, val := range k.Value.Columns {
				if val.Default == "" && val.Name != k.Value.PrimaryKey {
					if val.Name != k.Value.PrimaryKey {
						typeDetail = fmt.Sprintf(`%v,%v %v%v`, typeDetail, val.Name, val.Type, val.Length)
						dataSelect = fmt.Sprintf(`%v,%v`, dataSelect, val.Name)
					}
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
		for _, val := range allDetails {
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
		rs = fmt.Sprintf(`
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
			END CATCH `,
			jsonData,
			rs,
			queryDetail)
		return
	}
	rs = fmt.Sprintf(`
			DECLARE @temptable table(id smallint)
			%v
			SELECT id FROM @temptable;`, rs)
	return
}

// Private functions declaration
func (rp *repository) AutoExecIns(us *sts.Client, cid string, dataBody map[string]interface{}) (rs string, err error) {
	var stMaintainer StMaintainer
	stMant := rp.StManteiner(us, cid)
	err = json.Unmarshal([]byte(stMant[0].Struct), &stMaintainer)
	if err != nil {
		return
	}
	if stMaintainer.ProcI != "" {
		rs, err = rp.ExecJson(us, stMaintainer.ProcI, us.CompanyId, dataBody)
		if err != nil {
			return
		}
	} else {
		res, err := rp.getQueryIns(us, cid, stMaintainer, dataBody)
		id, err := us.Sql.Queryx(res)
		logger.Info("query insert --->", res)
		if err != nil {
			logger.Error("error insert --->", err)
			return "", err
		}
		var ResultID int
		for id.Next() {
			if err = id.Scan(&ResultID); err != nil {
				logger.Error("error insert scan--->", err)
				return "", err
			}
		}
		rsString := strconv.Itoa(ResultID)
		return rsString, err
	}
	return
}
