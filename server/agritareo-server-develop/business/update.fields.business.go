package business

import (
	"encoding/json"
	"ns-api/business/maintainerBusiness"
	"ns-api/common/logger"
	"ns-api/core/sts"
	"strings"
)

// constants

// Struct declaration

// Funciones privadas
func searchHeader(array []string, key interface{}) bool {
	for _, v := range array {
		if v == key || key == "idempresa" {
			return true
		}
	}
	return false
}
func searchDetails(arrayMetatable map[string]interface{}, key interface{}, value interface{}) bool {
	var details = value.(map[string]interface{})
	for keyD, valueD := range details {
		stDetail := arrayMetatable[strings.ToUpper(keyD)]
		if stDetail == nil {
			return false
		}
		detail := valueD.([]interface{})
		for _, v := range detail {
			if v != nil {
				var jsonData = v.(map[string]interface{})
				for keyDt := range jsonData {
					if keyDt != "_id" {
						for i, stKey := range stDetail.([]string) {
							if stKey == keyDt {
								break
							}
							if len(stDetail.([]string)) == (i + 1) {
								return false
							}
						}
					}
				}
			}
		}
	}
	return true
}
func (rp *repository) validateCoincidencesMt(us *sts.Client, cid string, dataBody map[string]interface{}) bool {
	//meta, _ := Component.GetMeta(us, cid)
	var stMaintainer maintainerBusiness.StMaintainer
	var arrColumns []string
	var dtColumns = make(map[string]interface{})

	stMant := rp.StManteiner(us, cid)
	err := json.Unmarshal([]byte(stMant[0].Struct), &stMaintainer)
	if err != nil {
		logger.Error("validateCoincidencesMt", err)
	}
	for _, val := range stMaintainer.StructMaintainer.Header.Columns {
		arrColumns = append(arrColumns, val.Name)
	}
	for _, value := range stMaintainer.StructMaintainer.Detail {
		var dtArrColumns []string
		for _, c := range value.Value.Columns {
			dtArrColumns = append(dtArrColumns, c.Name)
		}
		dtColumns[strings.ToUpper(value.Value.SourceName)] = dtArrColumns
	}
	for key, value := range dataBody {
		if key != "detalles" {
			if searchHeader(arrColumns, key) != true {
				return false
			}
		} else {
			if searchDetails(dtColumns, key, value) != true {
				return false
			}
		}

	}
	return true
}

// Funciones publicas
func (rp repository) ValidateFields(us *sts.Client, cid string, dataBody map[string]interface{}) bool {
	if rp.validateCoincidencesMt(us, cid, dataBody) != true {
		return false
	}
	return true
}

// Export name declaration
var UpdateFields = &repository{}
