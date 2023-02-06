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

type wareHousehBody struct {
	IdSucursal int    `db:"idsucursal" json:"idsucursal" validate:"required"`
	Nombre     string `db:"nombre" json:"label" validate:"required"`
	//Estado  bool 	`db:"habilitado" json:"enabled"`
}

func GetWareHouse(user *sts.Client) httpmessage.HttpMessage {
	var marca []wareHousehBody
	err := user.Sql.Select(&marca, `select id, nombre from TMALMACEN`)
	if err != nil {
		log.Println(err)
	}
	return httpmessage.Send(marca)
}

func PostWareHouse(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body wareHousehBody
	raw := utils.ParseBody(r, &body)
	//fmt.Println("fail", body)

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PInsertWareHouse, user.CompanyId, utils.JsonString(body))
	if err != nil {
		log.Println(err)
		return httpmessage.Error(locale.TryAgainLater)
	}
	//log.Println("Sucursal Registrada")
	return httpmessage.Log(raw)
}

func PutWareHouse(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	var body wareHousehBody
	raw := utils.ParseBody(r, &body)
	_, err := user.Sql.ExecJson(constants.PUpdateWareHouse, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		log.Println(err)
		return httpmessage.Error(locale.TryAgainLater)
	}
	return httpmessage.Log(raw)
}

func PatchWareHouse(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	_, err := user.Sql.ExecJson(constants.PPatchWareHouse, user.CompanyId, id)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(locale.TryAgainLater)
	}
	return httpmessage.Empty()
}
