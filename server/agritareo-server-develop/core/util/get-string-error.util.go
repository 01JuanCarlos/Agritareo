package util

func GetStringError(v interface{}) string {
	var message string

	if IsError(v) {
		message = v.(error).Error()
	}
	return message
}
