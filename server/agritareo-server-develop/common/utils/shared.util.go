package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io/ioutil"
	"net/http"
	"ns-api/common/logger"
	"strconv"
	"strings"
)

func QueryPagination(r *http.Request) (page, size, search, sort interface{}) {
	page = GetQuery(r, "start", "0")
	size = GetQuery(r, "length", "10")
	search = GetQuery(r, "search", "")
	sort = GetQuery(r, `sort`, "")
	return
}

type Format struct {
	Column string `json:"column"`
	Dir    string `json:"dir"`
}

func GetQuery(r *http.Request, key string, def ...interface{}) (resp interface{}) {
	switch key {
	case "sort":
		size := strings.Count(r.URL.RawQuery, key)
		n := 0
		var sort []Format
		for n < size/2 {
			column := fmt.Sprintf(`sort[%v][column]`, n)
			c1 := GetQuery(r, column)
			dir := fmt.Sprintf(`sort[%v][dir]`, n)
			d1 := GetQuery(r, dir)
			var s Format
			s.Column = c1.(string)
			s.Dir = d1.(string)
			sort = append(sort, s)
			n++
		}
		toJson, err := json.Marshal(sort)
		if err != nil {
			logger.Debug(err)
			//fmt.Println(err)
		}
		return string(toJson)
	default:
		param := r.URL.Query()[key]
		if len(param) == 0 {
			if len(def) == 0 {
				return nil
			}
			return def[0]
		}
		return param[0]
	}
}

func ParseBody(r *http.Request, st interface{}) map[string]interface{} {
	var validate map[string]interface{}
	data, _ := ioutil.ReadAll(r.Body)
	reader := ioutil.NopCloser(bytes.NewReader(data))
	_ = json.Unmarshal(data, &validate)
	_ = json.NewDecoder(reader).Decode(st)
	return validate
}

func GetVar(r *http.Request, key string) string {
	return mux.Vars(r)[key]
}

func GetIntVar(r *http.Request, key string) int {
	value,_ := strconv.ParseInt(GetVar(r, key), 10,32)
	return int(value)
}

func GetIntVarIds(r *http.Request, key string) (interface{},error) { // testeando sta vaina
	val := GetVar(r,key)
	if len(val) == 0 {
		 return nil, nil
	}
	value,err := strconv.ParseInt(val, 10,32)
	if err != nil {
		return nil, err
	}
	return value, nil
}


//
//func IsNumeric(value interface{}) (tipo bool) {
//	if value != 0 {
//		vtype := fmt.Sprintf(`%T`, value)
//		fmt.Println(vtype, value)
//		if vtype == "int" || vtype == "float64" || vtype == "int64" {
//			return true
//		}
//		return
//	}
//	return
//}

//func JsonParse(data string, v interface{}) {
//	err := json.Unmarshal([]byte(data), v)
//	if nil != err {
//		logger.Error("JsonParse %s", err.Error())
//	}
//}

func JsonString(v interface{}) string {
	data, err := json.Marshal(v)
	if nil != err {
		logger.Error("JsonString %s", err.Error())
	}
	return string(data)
}
