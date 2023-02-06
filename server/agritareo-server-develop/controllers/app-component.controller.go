package controllers

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

type bodyComponent struct {
	ShortCut    string `json:"atajo_teclado"`
	Code        string `json:"codigo"`
	AccessCode  string `json:"codigo_acceso"`
	Component   string `json:"componente" validate:"required"`
	Description string `json:"descripcion"`
	Metadata    string `json:"metadata"`
	Proc        string `json:"proc"`
	Type        string `json:"tipo" validate:"required"`
}
type bodyStructComponent struct {
	// G-ZERO
	Uuid           string `json:"uuid"`
	ModuleID       int    `json:"module_id"`
	ID             string `json:"id"`
	Cid            string `json:"cid"`
	Label          string `json:"label" validate:"required"`
	Description    string `json:"descripcion,omitempty"`
	Type           string `json:"tipo" validate:"required"`
	MetaData       string `json:"metadata,omitempty"`
	ParentID       string `json:"parent_id,omitempty"`
	ParentLabel    string `json:"parent_label,omitempty"`
	TransactionUID string `json:"transaction_uid,omitempty"`
}

func PostComponent(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body bodyComponent
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PInsertComponent, user.CompanyId, user.UserId, utils.JsonString(body))
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func PutComponent(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	var body bodyStructComponent
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PUpdateComponent, id, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}
