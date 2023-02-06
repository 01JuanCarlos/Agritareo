package util

import "fmt"

func IsString(val interface{}) bool {
	return "string" == fmt.Sprintf("%T", val)
}
