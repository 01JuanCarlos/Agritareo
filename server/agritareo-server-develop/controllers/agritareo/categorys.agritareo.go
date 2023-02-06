package agritareo

import (
	"log"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/locale"
	"ns-api/core/validator"

)

type categoriaBody struct {
	Id     int    `db:"id" json:"id,omitempty"`
	Nombre string `db:"nombre" json:"nombre" validate:"required,notBlank"`
	Codigo string `db:"codigo" json:"codigo,omitempty"`
}

func GetCategorys(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var category []categoriaBody
	err := user.Sql.Select(&category, `select id , nombre, codigo from TMTRAMPA_CATEGORIA`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(category)
}

func CreateCategorys(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body categoriaBody
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.TInsertTrampaCategoria,
		user.CompanyId,
		body.Nombre,
		body.Codigo,
		)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func UpdateCategorys(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body categoriaBody
	id := utils.GetIntVar(r, "id")
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.Exec(constants.TUpdateTrampaCategoria, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func DeleteCategorys(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(constants.TDeleteTrampaCategoria, user.CompanyId, id)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}
