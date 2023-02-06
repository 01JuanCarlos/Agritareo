package warehouse

import (
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
)

type ProductCompanyBody struct {
	ProductID  interface{} `json:"idproducto" validate:"required"`
	Code       interface{} `json:"codigo" validate:"required"`
	SubGrupoID interface{} `json:"idsubgrupo" validate:"required"`
}

func PostProductCompany(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body ProductCompanyBody
	raw := utils.ParseBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PInsertProductComapny, user.CompanyId, utils.JsonString(body))
	if err != nil {
		//log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func PutProductCompany(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	var body ProductCompanyBody
	raw := utils.ParseBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PUpdateProductCompany, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		//log.Println(err)
		return httpmessage.Error(locale.SomethingBadHappened)
	}
	return httpmessage.Log(raw)
}
