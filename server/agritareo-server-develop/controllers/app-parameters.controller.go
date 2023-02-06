package controllers

import (
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/config"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
)

type ParametersFx struct {
	Id               int          `db:"id" json:"id,omitempty"`
	PeID             int          `db:"peid" json:"peid,omitempty"`
	EmpresaID        int          `db:"idempresa" json:"idempresa,omitempty"`
	ParametroID      *interface{} `db:"idparametro" json:"idparametro"`
	ParamName        string       `db:"nombre_parametro" json:"parametro,omitempty"`
	ParamDescription string       `db:"descripcion_parametro" json:"descripcion,omitempty"`
	ComponentID      *interface{} `db:"idcomponente" json:"idcomponente,omitempty"`
	InternalID       *interface{} `db:"idinterno_dadicional" json:"idinterno_dadicional,omitempty"`
	Value            *interface{} `db:"valor" json:"valor,omitempty"`
	UseDefaultValue  bool         `db:"valordefecto" json:"valordefecto"`
	Cid              *interface{} `db:"cid" json:"cid,omitempty"`
	IdRef            *interface{} `db:"idref" json:"idref,omitempty"`
}

func GetParametersCompany(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	idref := utils.GetQuery(r, "idref")
	cid := utils.GetQuery(r, "cid")
	var params []ParametersFx
	err := user.Sql.SelectProcedure(&params, constants.PGetParametersCompany, user.CompanyId, cid, idref)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(params)
}

func PostParametersCompany(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body ParametersFx
	raw := utils.ParseBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(
		constants.PUpdateParametersCompany,
		user.CompanyId,
		user.UserId,
		utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func UpdateParametersCompany(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body ParametersFx
	raw := utils.ParseBody(r, &body)
	body.Id = id

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PUpdateParametersCompany,
		user.CompanyId,
		user.UserId,
		utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func GetListModule(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	result, err := user.Sql.ExecJson(constants.PGetParametersList, user.CompanyId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

type params struct {
	Parametro    string      `json:"parametro" validate:"required"`
	Description  string      `json:"descripcion" validate:"required"`
	ValueDef     interface{} `json:"valordefecto"`
	TranactionID string      `json:"transaction_uid,omitempty"`
}

// ------- Only Params
func PostParameters(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body params
	body.TranactionID = r.Header.Get(config.TransactionHeader)
	if ok, errors := validator.Validate(body); !ok {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	result, err := user.Sql.ExecJson(constants.PInsertParams, user.CompanyId, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(result)
}

func PutParameters(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body params
	raw := utils.ParseBody(r, &body)
	if ok, errors := validator.Validate(body); !ok {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PUpdateParams, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		logger.Debug(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

//func DeleteParameters (user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetIntVar(r, "id")
//	_, err := user.Sql.ExecJson(constants.PUpdateParams, user.CompanyId, id)
//	if err != nil {
//		logger.Debug(err)
//		return httpmessage.Error(err)
//	}
//	return  httpmessage.Log(id)
//}
