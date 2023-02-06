package agritareo

import (
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
)

type thresholdBody struct {
	Descripcion string `json:"descripcion" validate:"required,notBlank"`
	Codigo      string `json:"codigo" validate:"required,notBlank"`
	Idconcepto  int    `json:"idconcepto" validate:"required,notBlank"`
	Idvariedad  int    `json:"idvariedad" validate:"required,notBlank"`
	Rango1      string `json:"rango_1" validate:"required,notBlank"`
	Rango2      string `json:"rango_2" validate:"required,notBlank"`
	Rango3      string `json:"rango_3" validate:"required,notBlank"`
}

func CreateThreshold(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body thresholdBody
	raw := utils.ParseBody(r, &body)
	body.Idconcepto = utils.GetIntVar(r, "cid")
	body.Idvariedad = utils.GetIntVar(r, "vid")
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PInsertThreshold,
		user.CompanyId,
		utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

// FIXME IMPLEMENT CONTROLLERS
func UpdateThreshold(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	return httpmessage.Log("")
}

func DeleteThreshold(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	return httpmessage.Log("")
}
