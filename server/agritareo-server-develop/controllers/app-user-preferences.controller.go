package controllers

import (
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/locale"
)

type userComponents struct {
	Code        string `json:"codigo" validate:"required"`
	Description string `json:"descripcion" validate:"required"`
	Value       string `json:"valor" validate:"required"`
}

func GetUserPreferences(user *sts.Client) httpmessage.HttpMessage {
	result, err := user.Sql.ExecJson(constants.PGetUserPreferences, user.CompanyId, user.UserId)
	if err != nil {
		return httpmessage.Error(locale.SomethingBadHappened)
	}
	return httpmessage.Json(result)

}

func PostUserPreferences(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body userComponents
	//id := utils.GetVar(r, "id")
	raw := utils.ParseBody(r, body)
	var data []interface{}
	for _, v := range raw {
		data = append(data, v)
	}
	_, err := user.Sql.ExecJson(constants.PInsertUserPreferences, user.CompanyId, user.UserId, utils.JsonString(data))
	if err != nil {
		//fmt.Println(err)
		return httpmessage.Error(locale.SomethingBadHappened)
	}
	//return utils.RawMessage(result, raw)
	return httpmessage.Empty()
}
