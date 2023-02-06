package sts

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strconv"
)

type ExtendedMap interface {
	String() string
	Int() int
	Base64Decode() string
	Struct() interface{}
	StructSlice() []interface{}
	Slice() []interface{}
}

type ExtendMap struct {
	Key    string
	Values map[string]interface{}
	Def    interface{}
}

func (q *ExtendMap) getDefaultValue() interface{} {
	if nil != q.Def {
		if def, ok := q.Def.([]interface{}); ok && 0 < len(def) {
			return def[0]
		}
	}
	return nil
}

func (q *ExtendMap) String() string {
	if nil == q.Values || "" == q.Key {
		if def := q.getDefaultValue(); nil != def {
			return fmt.Sprintf(`%v`, def)
		}
		return ""
	}

	v, ok := q.Values[q.Key]

	if !ok {
		if def := q.getDefaultValue(); nil != def {
			return fmt.Sprintf(`%v`, def)
		}
		return ""
	}

	return fmt.Sprintf(`%v`, v)
}

func (q *ExtendMap) Int() int {
	s := q.String()
	v, _ := strconv.Atoi(s)
	//v, _ := strconv.ParseInt(s, 10, 64)
	return v
}

func (q *ExtendMap) Base64Decode() string {
	dec, err := base64.URLEncoding.DecodeString(q.String())

	if nil != err {
		if def := q.getDefaultValue(); nil != def {
			return fmt.Sprintf(`%v`, def)
		}
	}

	return string(dec)
}

// Pendientes de implementacion
func (q *ExtendMap) Struct() interface{} {
	m := make(map[string]interface{})
	_ = json.Unmarshal([]byte(q.String()), &m)
	return m
}

func (q *ExtendMap) StructSlice() []interface{} {
	m := make([]interface{}, 0)
	return m
}

func (q *ExtendMap) Slice() []interface{} {
	m := make([]interface{}, 0)
	return m
}
