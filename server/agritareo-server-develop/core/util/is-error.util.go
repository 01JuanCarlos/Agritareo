package util

func IsError(val interface{}) bool {
	var v bool
	if nil != val {
		switch val.(type) {
		case error:
			v = true
		}
	}
	return v
}
