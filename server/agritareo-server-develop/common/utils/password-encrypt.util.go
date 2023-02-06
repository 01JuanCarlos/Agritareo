package utils

import (
	"crypto/sha256"
	"encoding/base64"
)

func PasswordEncrypt(password string) string  {
	pass := sha256.New()
	pass.Write([]byte(password))
	sha := pass.Sum(nil)
	pwd := base64.URLEncoding.EncodeToString(sha)
	return pwd
}