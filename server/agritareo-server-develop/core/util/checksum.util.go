package util

import (
	"crypto/md5"
	"fmt"
)

func CheckSum(text string) string {
	md5Sum := md5.Sum([]byte(text))
	return fmt.Sprintf(`%x`, md5Sum)
}
