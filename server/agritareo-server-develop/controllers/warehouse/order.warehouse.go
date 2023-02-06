package warehouse

import (
	"encoding/json"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/config"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/util"
	"ns-api/core/validator"
	"ns-api/locale"
)

type orderBody struct {
	Sucursal       int         `json:"idsucursal" validate:"required"`
	Almacen        int         `json:"idalmacen" validate:"required"`
	ProvID         int         `json:"idclieprov" validate:"required"`
	DocSerie       interface{} `json:"documento_serie" validate:"required"`
	Date           interface{} `json:"fecha" validate:"required"`
	Glosa          string      `json:"glosa"`
	MonedaID       int         `json:"idmoneda" validate:"required"`
	TCambio        interface{} `json:"tcambio" validate:"required"`
	PedidoDetalle  interface{} `json:"pedido_d" validate:"required"`
	TransactionUID string      `json:"transaction_uid,omitempty"`
}

type orderDetailsBody struct {
	PedidoD PedidoDBody `json:"pedido_d" validate:"required"`
}
type PedidoDBody struct {
	ProuctID interface{} `json:"idproducto" validate:"required"`
	UnidadID interface{} `json:"idmedida" validate:"required"`
	Total    interface{} `json:"cantidad" validate:"required"`
	Price    interface{} `json:"precio" validate:"required"`
	OrderID  int         `json:"idpedido" validate:"required"`
}

func PostOrder(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body orderBody
	raw := utils.ParseBody(r, &body)
	body.TransactionUID = r.Header.Get(config.TransactionHeader)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	id, err := user.Sql.ExecJson(constants.PInsertOrder, user.CompanyId, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	// return httpmessage.Log(raw)
	return httpmessage.Send(json.RawMessage(id), utils.JsonString(raw))
}
func PutOrder(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	var body orderBody
	raw := util.GetBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PUpdateOrder, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(utils.JsonString(raw))
}

// Order Description
func PostOrderD(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body PedidoDBody
	raw := utils.ParseBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PInsertOrderDescription, user.CompanyId, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func PutOrderD(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	var body orderBody
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PUpdateOrderDescription, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}
