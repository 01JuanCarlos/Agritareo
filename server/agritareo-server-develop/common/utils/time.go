package utils

import (
	"time"
)

func DateParse ()  (string){
	current := time.Now().String()
	return current
}