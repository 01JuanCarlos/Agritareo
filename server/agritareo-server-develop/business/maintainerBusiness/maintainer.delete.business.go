package maintainerBusiness

import (
	"encoding/json"
	"fmt"
	"ns-api/common/logger"
	"ns-api/core/sts"
	"ns-api/modules/log"
)

// private function

func (rp *repository)  getQueryDel(us *sts.Client, cid interface{},id int) (rs string,err error){
	var stMaintainer StMaintainer
	var query string
	stMant := rp.StManteiner(us, cid)

	err = json.Unmarshal([]byte(stMant[0].Struct), &stMaintainer)
	if err != nil {
		return
	}
	if len(stMaintainer.StructMaintainer.Detail) > 0 {
		log.Debug("header con detail")
		// ------------------------MORE DETAILS
		for _, k := range stMaintainer.StructMaintainer.Detail {
			query =  query + fmt.Sprintf(`DELETE FROM %v WHERE %v = '%v'`,
				k.Value.SourceName,
				k.Value.ForeignKey,
				id)
		}                   
	}
	query =  query + fmt.Sprintf(`DELETE FROM %v WHERE %v = '%v'`,
		stMaintainer.StructMaintainer.Header.SourceName,
		stMaintainer.StructMaintainer.Header.PrimaryKey,
		id)
	rs = query
	return
}

// private function

func (rp *repository) AutoExecDel(us *sts.Client,cid interface{},id int) (err error){
	query,err := rp.getQueryDel(us,cid,id)
	if err != nil {
		log.Error("error query delete --->",err)
		return
	}
	_, err = us.Sql.Queryx(query)
	logger.Info("query delete --->", query)
	if err != nil {
		log.Error("error exec delete ---> ",err)
		return
	}
	return
}

