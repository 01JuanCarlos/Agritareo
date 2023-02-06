package controllers

import (
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
)

type companyPreferences struct {
	Code        string `json:"codigo" validate:"required"`
	Description string `json:"descripcion" validate:"required"`
	Value       string `json:"valor" validate:"required"`
}

func GetCompanyPreferences(user *sts.Client) httpmessage.HttpMessage {
	result, err := user.Sql.ExecJson(constants.PGetCompanyPreferences, user.CompanyId)
	if err != nil {
		return httpmessage.Error(locale.SomethingBadHappened)
	}
	return httpmessage.Json(result)

}

func PostCompanyPreferences(user *sts.Client) httpmessage.HttpMessage {
	var body companyPreferences

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	result, err := user.Sql.ExecJson(constants.PInsertCompanyPreferences, user.CompanyId, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(locale.SomethingBadHappened)
	}
	return httpmessage.Send(result)
}
