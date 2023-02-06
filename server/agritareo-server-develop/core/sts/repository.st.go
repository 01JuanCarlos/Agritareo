package sts

import (
	"fmt"
	"ns-api/common/utils"
	"ns-api/core/cache"
	"ns-api/core/services/mssql"
)

const (
	prefix = "_repository_"
)

type Repository struct {
}

func (rp *Repository) GetCache(key string) ([]byte, error) {
	return cache.Get(fmt.Sprintf(`%s::%s`, prefix, key))
}

func (rp *Repository) SetCache(key string, value []byte) error {
	return cache.Set(fmt.Sprintf(`%s::%s`, prefix, key), value)
}

func (rp *Repository) HasCache(key string) bool {
	return cache.Has(fmt.Sprintf(`%s::%s`, prefix, key))
}

// deprecated: use Sql instead
func (rp *Repository) Connection(conn *mssql.DatabaseConnection) (*mssql.DatabaseConnection, bool) {
	return conn, true
}

// deprecated: Use Sql.ExecJson
func (rp *Repository) ExecJson(us *Client, proc string, companyId interface{}, dataBody map[string]interface{}) (rs string, err error) {
	if db, isValid := rp.Connection(us.Sql); isValid {
		rs, err = db.ExecJson(proc, companyId, utils.JsonString(dataBody))
		if err != nil {
			return
		}
	}
	return
}
