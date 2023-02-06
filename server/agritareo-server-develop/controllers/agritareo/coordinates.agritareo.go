package agritareo

import (
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
)

func DeleteCoordinates (user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	code := utils.GetVar(r , "code")
	_, err := user.Sql.ExecJson(constants.PDeleteCoordinates, user.CompanyId, code)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}