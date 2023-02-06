package maintainerBusiness

import (
	"encoding/json"
	"ns-api/common/logger"
	"ns-api/core/services/mssql"
	"ns-api/core/sts"
)

// Private functions declaration
func (rp *repository) AutoExecSelect(us *sts.Client, cid string, id int) (rs interface{}, meta *mssql.HttpMetaResponse, err error) {
	var stMaintainer StMaintainer
	stMant := rp.StManteiner(us, cid)
	err = json.Unmarshal([]byte(stMant[0].Struct), &stMaintainer)
	if err != nil {
		return
	}
	if stMaintainer.ProcF != "" {
		rs, meta, err = us.Sql.Find(stMaintainer.ProcF+"_F", us.CompanyId, id)
		if nil != err {
			logger.Error("Error AutoExecSelect --> ", err)
			return
		}
	} else if stMaintainer.Proc != "" {
		rs, meta, err = us.Sql.Find(stMaintainer.Proc+"_F", us.CompanyId, id)
		if nil != err {
			logger.Error("Error AutoExecSelect --> ", err)
			return
		}
	}
	return
}
