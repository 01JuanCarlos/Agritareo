package utils

import "encoding/json"

func ToJson(c interface{}) (result interface{}) {
	if c != nil {
		result = json.RawMessage(c.(string))
	}
	return
}