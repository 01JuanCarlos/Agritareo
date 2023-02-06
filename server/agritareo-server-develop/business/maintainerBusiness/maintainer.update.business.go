package maintainerBusiness

import (
	"encoding/json"
	"errors"
	"fmt"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/core/sts"
	"strconv"
	"strings"
)

// struct
type mDetailUp struct {
	TypeDetail   string
	FieldsDetail string
	FieldSource  string
	SourceName   string
	Key          string
	Fkey         string
	UpdateSet    string
}

// Private functions declaration
func getColumnsUpdate(dataBody map[string]interface{}) string {
	var count = 0
	var fields string
	for key, value := range dataBody {
		if key != "idempresa" && key != "id" && key != "transaction_uid" && key != "detalles" && key != "_id" {
			if count != 0 {
				fields = fmt.Sprintf(`%v, %v = '%v'`, fields, key, value)
			} else {
				fields = fmt.Sprintf(`%v = '%v'`, key, value)
			}
			count++
		}
	}
	return fields
}
func getColumnsUpdateDetails(dataBody map[string]interface{}) string {
	var count = 0
	var fields string
	for key := range dataBody {
		if key != "idempresa" && key != "id" && key != "_id" {
			if count != 0 {
				fields = fmt.Sprintf(`%v, [target].%v = [source].%v`, fields, key, key)
			} else {
				fields = fmt.Sprintf(`[target].%v = [source].%v`, key, key)
			}
			count++
		}
	}
	return fields
}
func (rp *repository) getQueryUpd(us *sts.Client, cid interface{}, stMaintainer StMaintainer, dataBody map[string]interface{}, id int) (rs string, err error) {
	fields := getColumnsUpdate(dataBody)
	var query string
	logger.Debug("fields update --->", fields)
	queryTrans := `	BEGIN TRANSACTION GUARDAR;
					BEGIN TRY
						%v
						BEGIN
							COMMIT TRANSACTION GUARDAR;
						END
					END TRY
					BEGIN CATCH
					ROLLBACK TRANSACTION GUARDAR;
					THROW
					END CATCH`
	if fields != "" {
		query = fmt.Sprintf(`UPDATE %v SET %v WHERE %v = %v;`,
			stMaintainer.StructMaintainer.Header.SourceName,
			fields,
			stMaintainer.StructMaintainer.Header.PrimaryKey,
			id)
	}

	if len(stMaintainer.StructMaintainer.Detail) > 0 {
		//logger.Debug("header con detail")
		// ------------------------MORE DETAILS
		// FIXME MESCLAR
		if dataBody["detalles"] == nil {
			rs = query
			return
		}
		var details = dataBody["detalles"].(map[string]interface{}) //obtiene los detalles del cuerpo
		for _, k := range stMaintainer.StructMaintainer.Detail {
			var validObj = details[strings.ToLower(k.Name)] // segun la metadata obtengo el cuerpo del body
			if validObj != nil {
				var detail = details[strings.ToLower(k.Name)].([]interface{}) //
				if len(detail) > 0 && detail != nil {
					for _, data := range detail {
						var fieldSource, fieldsDetail, typeDetail string
						if data != nil {
							var jsonData = data.(map[string]interface{})
							var ids string
							if len(jsonData) > 1 {
								fieldsDetailBody := getColumnsUpdateDetails(jsonData) //obtengo las columnas que se actualizan
								if fieldsDetailBody != "" {
									for _, val := range k.Value.Columns {
										if val.Default == "" {
											if val.Name != "id" {
												if k.Value.ForeignKey == val.Name {
													fieldSource = fieldSource + fmt.Sprintf(`,%v`, id)
												} else {
													fieldSource = fieldSource + fmt.Sprintf(`,[source].%v`, val.Name)
												}
												fieldsDetail = fieldsDetail + "," + val.Name
											}
											typeDetail = typeDetail + fmt.Sprintf(`,%v %v%v`, val.Name, val.Type, val.Length)
										}
									}
									fieldSource = strings.Replace(fieldSource, ",", "", 1)
									fieldsDetail = strings.Replace(fieldsDetail, ",", "", 1)
									typeDetail = strings.Replace(typeDetail, ",", "", 1)
									if 0 < len(detail) {
										query = query + fmt.Sprintf(`
									WITH cte AS (
										SELECT * FROM OPENJSON('%v')
										WITH(%v)
									)
									MERGE %v WITH(HOLDLOCK) AS [target]
									USING cte AS [source]
									ON [target].%v = [source].%v
									WHEN MATCHED THEN
									UPDATE SET
									%v
									WHEN NOT MATCHED BY TARGET THEN
									INSERT (%v) VALUES (%v);
									`,
											utils.JsonString(jsonData),
											typeDetail,
											k.Name,
											k.Value.PrimaryKey,
											k.Value.PrimaryKey,
											fieldsDetailBody,
											fieldsDetail,
											fieldSource,
										)
										//rs = query
									}
								}
							} else {
								ids = ids + fmt.Sprintf(`,%v`, jsonData["id"])
								query = query + fmt.Sprintf(`DELETE FROM %v WHERE id in (%v) ; `,
									k.Value.SourceName,
									ids[1:])
								//rs = query
							}
						}
					}
				}
			}
		}
	}
	rs = fmt.Sprintf(queryTrans,query)
	return
}

// Private functions declaration
func (rp *repository) AutoExecUdpd(us *sts.Client, cid interface{}, dataBody map[string]interface{}, id int) (rs string, err error) {
	var stMaintainer StMaintainer
	stMant := rp.StManteiner(us, cid)

	err = json.Unmarshal([]byte(stMant[0].Struct), &stMaintainer)
	if err != nil {
		return
	}
	if stMaintainer.ProcU != "" {
		rs, err = rp.ExecJson(us, stMaintainer.ProcU, us.CompanyId, dataBody)
		if err != nil {
			return
		}
	} else {
		res, err := rp.getQueryUpd(us, cid, stMaintainer, dataBody, id)
		fmt.Println("UPDATE QUERY-->", res)
		if res == "" {
			return rs, errors.New("Datos invalidos.")
		}
		id, err := us.Sql.Queryx(res)
		if err != nil {
			return "", err
		}
		var ResultID int
		for id.Next() {
			if err = id.Scan(&ResultID); err != nil {
				return "", err
			}
		}
		rsString := strconv.Itoa(ResultID)
		return rsString, err
	}
	return
}
