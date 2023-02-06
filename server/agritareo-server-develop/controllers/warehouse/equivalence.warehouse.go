package warehouse

import (
	"log"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
)

type equivalenceBody struct {
	ProductID interface{} `json:"idproducto" validate:"required"`
	Compra    interface{} `json:"para_compra" validate:"required"`
	Consumo   interface{} `json:"para_consumo" validate:"required"`
	Venta     interface{} `json:"para_venta" validate:"required"`
	MedidaID  interface{} `json:"idmedida" validate:"required"`
}

func PostEquivalence(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body equivalenceBody
	raw := utils.ParseBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PInsertEquivalence, user.CompanyId, utils.JsonString(body))
	if err != nil {
		log.Println(err)
		return httpmessage.Error(locale.SomethingBadHappened)
	}
	return httpmessage.Log(raw)
}

func PutEquivalence(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	var body equivalenceBody
	raw := utils.ParseBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PUpdateEquivalence, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		log.Println(err)
		return httpmessage.Error(locale.SomethingBadHappened)
	}
	return httpmessage.Log(raw)
}


