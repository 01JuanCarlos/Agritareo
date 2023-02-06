package warehouse

import (
	"encoding/json"
	"log"
	"net/http"
	"ns-api/business"
	"ns-api/common/constants"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/config"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
)

type productBody struct {
	Descripcion        string      `json:"descripcion"`
	Codigo             string      `json:"codigo" validate:"required,notBlank"`
	Marca              interface{} `json:"idmarca" validate:"required,notBlank"`
	Modelo             interface{} `json:"idmodelo" validate:"required,notBlank"`
	MedidaPrincipal    interface{} `json:"idmedida_principal" validate:"notBlank"`
	Grupo              interface{} `json:"idgrupo" validate:"notBlank"`
	SubGrupo           interface{} `json:"idsubgrupo" validate:"notBlank"`
	NombreProducto     string      `json:"nombre" validate:"required,notBlank"`
	CodigoEquivalencia string      `json:"codigo_equivalencia" validate:"required,notBlank"`
	MedidaCompra       interface{} `json:"idmedida_compra" validate:"notBlank"`
	MedidaVenta        interface{} `json:"idmedida_venta" validate:"notBlank"`
	TransactionUID     string      `json:"transaction_uid,omitempty"`
	Equivalencia       interface{} `json:"equivalencias"`
	Impuestos          interface{} `json:"impuestos"`
}


// variable
var table = "TMPRODUCTO"

// fixme: revisar envio de id del producto
func PostProduct(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body productBody
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	body.TransactionUID = r.Header.Get(config.TransactionHeader)
	id, err := user.Sql.ExecJson(constants.PInsertProduct, user.CompanyId, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(json.RawMessage(id), raw)
}

func PutProduct(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	var body productBody
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PUpdateProduct, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		logger.Debug(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func PatchProduct(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	_, err := user.Sql.ExecJson(constants.PPatchProduct, user.CompanyId, id)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

func DeleteProduct(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	_, err := user.Sql.ExecJson(constants.PDeleteProduct, user.CompanyId, id)
	if err != nil {
		rs, er := business.RegisterExists.Exists(user, table, id, "")
		if er != nil {
			return httpmessage.Error(locale.SomethingBadHappened, er.Error())
		}
		if rs != nil {
			logger.Info("REGISTRO USADO -->", rs)
			return httpmessage.Error(locale.SomethingBadHappened, er, rs)
		}
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}
