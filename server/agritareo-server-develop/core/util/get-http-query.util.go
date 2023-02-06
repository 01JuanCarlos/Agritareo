package util

import (
	"net/http"
	"ns-api/core/sts"
)


func GetQuery(key string, r *http.Request, def ...interface{}) sts.ExtendedMap {
	_queryParams := &sts.ExtendMap{
		Key:    key,
		Values: FlatMapString(r.URL.Query()),
	}

	if 0 < len(def) {
		_queryParams.Def = def[0]
	}

	return _queryParams
}
