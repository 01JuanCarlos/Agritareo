package util

func GetIntValue(slice []interface{}, index int) int {
	if len(slice) > index && IsInt(slice[index]) {
		return slice[index].(int)
	}
	return 0
}
