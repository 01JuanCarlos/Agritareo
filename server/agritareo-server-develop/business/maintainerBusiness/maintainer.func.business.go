package maintainerBusiness

import (
	"fmt"
	"ns-api/core/sts"
	"strings"
)

// Deprecated: use Component.GetMeta
func (rp repository) StManteiner(us *sts.Client, cid interface{}) (rs []MetaTable) {
	if db, isValid := rp.Connection(us.Sql); isValid {
		_ = db.SelectProcedure(&rs, "GETMETATABLE_F", us.CompanyId, cid)
		fmt.Println(rs)
	}
	return
}

func (rp repository) GetColumnsValues(columns []columns, dataBody map[string]interface{}) (fmFormat string, values string) {
	var fields string
	for _, val := range columns {
		if val.Default == "" && val.Name != "id" && val.Is_Computed != true {
			for key, v := range dataBody {
				if val.Name == key && v != nil {
					fields = fields + "," + val.Name
					fmFormat = strings.Replace(fields, ",", "", 1)
					if values != "" {
						values = fmt.Sprintf(`%v, '%v'`, values, v)
					} else {
						values = fmt.Sprintf("'%v'", v)
					}
					break
				}
			}
		}
	}
	return
}

