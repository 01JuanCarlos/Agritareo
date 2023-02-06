package business

import (
	"encoding/json"
	"ns-api/business/maintainerBusiness"
	"ns-api/core/sts"
)

// variable private

var CHECKCONSTRAINTS = "CHECKCONSTRAINTS"

// struct declaration
type resultCheck struct {
	NRegistros interface{} `db:"nRegistros" json:"nRegistros"`
	//TableName  string      `db:"tableName" json:"tableName"`
	FormName string `db:"formName" json:"formName"`
}

// private function
func (rp *repository) checkRegistration(us *sts.Client, table string, id interface{},tbDetails string) (rs []resultCheck, err error) {
	if db, isValid := rp.Connection(us.Sql); isValid {
		err = db.SelectProcedure(&rs, CHECKCONSTRAINTS, table, id,tbDetails)
	}
	return
}

// public function

func (rp *repository) ExistsMt(us *sts.Client, cid string, id interface{}) (rs []resultCheck, err error) {
	var stMaintainer maintainerBusiness.StMaintainer
	var tbDetails string
	stMant := rp.StManteiner(us, cid)
	err = json.Unmarshal([]byte(stMant[0].Struct), &stMaintainer)
	if err != nil {
		return
	}
	if len(stMaintainer.StructMaintainer.Detail) > 0 {
		for _, k := range stMaintainer.StructMaintainer.Detail {
			tbDetails =  tbDetails + "," + k.Value.SourceName
		}
	}
	if tbDetails != ""{
		rs, err = rp.checkRegistration(us, stMaintainer.StructMaintainer.Header.SourceName, id,tbDetails[1:])
	}else {
		rs, err = rp.checkRegistration(us, stMaintainer.StructMaintainer.Header.SourceName, id,"")
	}
	return
}

func (rp *repository) Exists(us *sts.Client, table string, id interface{},tbDetails string) (rs []resultCheck, err error) {
	rs, err = rp.checkRegistration(us, table, id,tbDetails)
	return
}

// export variable

var RegisterExists = &repository{}
