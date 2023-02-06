package agritareo

import (
	"fmt"
	"net/http"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
)

const spConceptType = "TIPO_CONCEPTO_AGRICOLA"

type conceptType struct {
	Id          int         `db:"id" json:"id,omitempty"`
	Code        *string     `db:"codigo" json:"codigo" validate:"required,notBlank"`
	Name        *string     `db:"nombre" json:"nombre"`
	Description *string     `db:"descripcion" json:"descripcion"`
	Status      bool        `db:"estado" json:"estado"`
	MetaForm    interface{} `db:"meta_form" json:"meta_form"`
}

func GetConceptType(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	p := utils.GetQuery(r, "page", "")
	i := utils.GetQuery(r, "items", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	result, err := user.Sql.Page(
		fmt.Sprintf(`%v`, spConceptType+"_L"),
		user.CompanyId,
		i,
		p,
		s,
		o,
	)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Page(
		result.Data,
		result.TotalFiltered,
		result.TotalRows,
	)
}
func GetConceptTypeDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body []conceptType
	id := utils.GetIntVar(r, "id")

	err := user.Sql.SelectProcedure(&body, spConceptType+"_F", user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	if len(body) > 0 {
		b := body[0]
		body[0].MetaForm = utils.ToJson(b.MetaForm)
		return httpmessage.Send(body[0])
	}
	return httpmessage.Send(body)
}

func CreateConceptType(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body conceptType
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	result, err := user.Sql.ExecJson(spConceptType+"_I", user.CompanyId, nil, utils.JsonString(body), user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(result, raw)
}

func UpdateConceptType(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body conceptType
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(spConceptType+"_I", user.CompanyId, id, utils.JsonString(body), user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func DeleteConceptType(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(spConceptType+"_D", user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}
