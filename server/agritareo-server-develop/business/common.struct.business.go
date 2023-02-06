package business

import (
	"ns-api/business/maintainerBusiness"
	"ns-api/core/sts"
)

// common struct
type repository struct {
	sts.Repository
}

//  public func
func (rp repository) StManteiner(us *sts.Client, cid interface{}) (rs []maintainerBusiness.MetaTable) {
	if db, isValid := rp.Connection(us.Sql); isValid {
		_ = db.SelectProcedure(&rs, "GETMETATABLE_F", us.CompanyId, cid)
	}
	return
}

