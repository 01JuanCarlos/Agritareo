package controllers

import (
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/config"
	"ns-api/core/server/httpmessage"
	"ns-api/core/services/mssql"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
)

type Profile struct {
	Id             float32 `db:"id" json:"id,omitempty"`
	Code           string  `db:"codigo" json:"codigo"`
	Name           string  `db:"nombre" json:"label,omitempty"`
	Enabled        *uint8  `json:"status,omitempty"`
	Type           int     `json:"type,omitempty" validate:"number,required"`
	Description    string  `json:"descripcion,omitempty"`
	Deleted        uint8   `json:"eliminado,omitempty"`
	TransactionUID string  `json:"transaction_uid,omitempty"`
}

type ProfileType struct {
	Id   int    `db:"id" json:"id"`
	Name string `db:"nombre" json:"nombre"`
}

func GetProfile(user *sts.Client) httpmessage.HttpMessage {
	var profile []Profile
	err := mssql.Select(user.Sql, &profile, `select id, nombre, codigo from TMPERFIL`)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(profile)
}

func GetProfileType(user *sts.Client) httpmessage.HttpMessage {
	var profileType []ProfileType
	_ = mssql.Select(user.Sql, &profileType, `select id, nombre from TMTIPOPERFIL`)
	return httpmessage.Send(profileType)
}

func PostProfile(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body Profile
	raw := utils.ParseBody(r, &body)
	body.TransactionUID = r.Header.Get(config.TransactionHeader)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PInsertProfile, user.CompanyId, utils.JsonString(body))
	if err != nil {
		logger.Debug(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func PutProfile(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	var body Profile
	raw := utils.ParseBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PUpdateProfile, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		logger.Debug(err.Error())
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func PermissionProfile(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	result, err := user.Sql.ExecJson(constants.PGetProfileComponent, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func PatchProfile(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	_, err := user.Sql.ExecJson(constants.PPatchProfile, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}
