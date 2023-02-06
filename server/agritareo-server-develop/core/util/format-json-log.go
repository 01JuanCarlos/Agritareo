package util

import "encoding/json"

// struct

type LogData struct {
	Tabla string
	Campo string
	Value interface{}
}

// private function
func clearLog(table, key string, value, method interface{}) LogData {
	if method == "PUT" || method == "PATCH" {
		if key != "idempresa" && key != "id" && key != "transaction_uid" && key != "detalles" &&
			key != "_id" && key != "habilitado" || (method == "PATCH" && key == "habilitado") {
			return LogData{Tabla: table, Campo: key, Value: value}
		}
		return LogData{}
	} else {
		if key != "id" && key != "_id" {
			return LogData{Tabla: table, Campo: key, Value: value}
		}
		return LogData{}
	}

}

// public funcion

func FormatLog(body interface{}, method string) interface{} {
	var mapBody map[string]interface{}
	inrec, _ := json.Marshal(body)
	json.Unmarshal(inrec, &mapBody)
	var logData []LogData
	for key, value := range mapBody {
		if key == "detalles" {
			details := mapBody["detalles"].(map[string]interface{})
			for keyD, valueD := range details {
				detail := valueD.([]interface{})
				for _, v := range detail {
					if v != nil {
						var jsonData= v.(map[string]interface{})
						for keyDt, valDt := range jsonData {
							dataLog := clearLog(keyD, keyDt, valDt, method)
							if dataLog.Tabla != "" && dataLog.Campo != "" {
								logData = append(logData, dataLog)
							}
						}
					}
				}
			}
		} else {
			dataLog := clearLog("principal", key, value, method)
			if dataLog.Tabla != "" && dataLog.Campo != "" {
				logData = append(logData, dataLog)
			}
		}
	}
	return logData
}
