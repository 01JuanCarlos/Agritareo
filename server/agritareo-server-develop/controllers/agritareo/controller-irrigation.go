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

type ControllerIrrigation struct {
	Id       int         `db:"id" json:"id,omitempty"`
	Code     string      `db:"codigo" json:"codigo"`
	Name     string      `db:"nombre" json:"nombre"`
	MetaForm interface{} `db:"meta_form" json:"meta_form"`
}

const spControlleIrrigation = "CONTROLADOR_RIEGO"

func GetControllerIrrigation(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	i := utils.GetQuery(r, "items", "")
	p := utils.GetQuery(r, "page", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	result, err := user.Sql.Page(spControlleIrrigation+"_L",
		user.CompanyId,
		i,
		p,
		s,
		o)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Page(
		result.Data,
		result.TotalFiltered,
		result.TotalRows,
	)
}

func GetControllerIrrigationDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body []ControllerIrrigation
	id := utils.GetIntVar(r, "id")
	err := user.Sql.SelectProcedure(&body, spControlleIrrigation+constants.DetailSuffix, user.CompanyId, id, user.UserId)
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

func CreateControllerIrrigation(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body ControllerIrrigation
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	result, err := user.Sql.ExecJson(spControlleIrrigation+"_I", user.CompanyId, nil, utils.JsonString(body), user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(result, raw)
}

func UpdateControllerIrrigation(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body ControllerIrrigation
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(spControlleIrrigation+"_I", user.CompanyId, id, utils.JsonString(body), user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func DeleteControllerIrrigation(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(spControlleIrrigation+"_D", user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}
