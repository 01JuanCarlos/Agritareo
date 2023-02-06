package maintainerBusiness

import (
	"encoding/json"
	"fmt"
	"ns-api/common/logger"
	"ns-api/core/sts"
)

// struct

// private function
func (rp *repository) getQueryDisabled(us *sts.Client, cid string, id int) (query string, err error) {
	var stMaintainer StMaintainer
	stMant := rp.StManteiner(us, cid)
	err = json.Unmarshal([]byte(stMant[0].Struct), &stMaintainer)
	if err != nil {
		return
	}
	table := stMaintainer.StructMaintainer.Header.SourceName
	pk := stMaintainer.StructMaintainer.Header.PrimaryKey
	query = fmt.Sprintf(
		`
		UPDATE %v SET idestado = 1^idestado
		WHERE %v = %v
		`, table, pk, id)
	return
}

// public function

func (rp *repository) AutoExecDis(us *sts.Client, cid string, id int) (result bool, err error) {
	query, err := rp.getQueryDisabled(us, cid, id)
	if err != nil {
		logger.Error("error query disabled --->", err)
		return
	}
	rs, err := us.Sql.Queryx(query)
	logger.Info("query disabled --> ", query)
	if err != nil {
		logger.Error("error exec disabled ---> ", err)
		return
	}
	// get Result
	for rs.Next() {
		rs.Scan(&result)
	}

	return
}
