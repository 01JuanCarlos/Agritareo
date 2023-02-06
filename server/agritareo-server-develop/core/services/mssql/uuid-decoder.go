package mssql

import (
	"encoding/hex"
	"fmt"
)

func reverse(u []byte) []byte {
	for i := 0; i < len(u)/2; i++ {
		u[i], u[len(u)-i-1] = u[len(u)-i-1], u[i]
	}
	return u
}

func DecodeUUID(u []byte) string {
	n := hex.EncodeToString(reverse(u[:4]))
	o := hex.EncodeToString(reverse(u[4:6]))
	p := hex.EncodeToString(reverse(u[6:8]))
	q := hex.EncodeToString(u[8:10])
	r := hex.EncodeToString(u[10:])
	return fmt.Sprintf(`%s-%s-%s-%s-%s`, n, o, p, q, r)
}
