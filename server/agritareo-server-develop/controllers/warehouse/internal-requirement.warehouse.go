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

type internalBody struct {
	IDEmpresa     interface{} `json:"idsucursal" validate:"required"`
	IDAlmacen     interface{} `json:"idalmacen" validate:"required"`
	IDMotivo      interface{} `json:"idmotivo" validate:"required"`
	LugarEntrega  interface{} `json:"lugar_entrega"`
	Glosa         interface{} `json:"glosa"`
	DocSerie      interface{} `json:"documento_serie" validate:"required"`
	Detalles      interface{} `json:"detalles" validate:"required"`
	Fecha         interface{} `json:"fecha" validate:"required"`
	IDArea        interface{} `json:"idarea" validate:"required"`
	IDResponsable interface{} `json:"idresponsable,omitempty"`
	//Periodo       interface{} `json:"periodo,omitempty"`
}

func PostInternalReq(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body internalBody
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PInsertInternalReq, user.CompanyId, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func PutInternalReq(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	var body internalBody
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PUpdateInternalReq, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}
