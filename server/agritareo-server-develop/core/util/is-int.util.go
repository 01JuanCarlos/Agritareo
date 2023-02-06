package util

import "fmt"

func IsInt(val interface{}) bool {
	return "int" == fmt.Sprintf("%T", val)
}
