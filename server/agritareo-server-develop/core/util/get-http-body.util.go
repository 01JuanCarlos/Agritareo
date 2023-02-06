package util

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"ns-api/core/sts"
	"ns-api/modules/log"
)

func GetBody(r *http.Request, st ...interface{}) (body sts.Body) {
	_buf, err := ioutil.ReadAll(r.Body)
	if nil != err {
		log.Error("No se puede leer el cuerpo de la solicitud.")
		return
	}

	_read := ioutil.NopCloser(bytes.NewBuffer(_buf))
	_ = json.Unmarshal(_buf, &body)

	if len(st) > 0 {
		_ = json.NewDecoder(_read).Decode(st[0])
	}
	r.Body = _read
	return
}
