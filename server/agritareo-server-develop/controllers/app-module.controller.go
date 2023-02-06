package controllers

import (
	"log"
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

type bodyModule struct {
	Name           string      `json:"label" validate:"required"`
	Metadata       interface{} `json:"metadata"`
	General        interface{} `json:"general" validate:"required"`
	Path           string      `json:"path"`
	TransactionUID string      `json:"transaction_uid,omitempty"`
}

func PostModule(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body bodyModule
	raw := utils.ParseBody(r, &body)
	body.TransactionUID = r.Header.Get(config.TransactionHeader)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PInsertModule, user.CompanyId, utils.JsonString(body))
	if err != nil {
		logger.Debug(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func PutModule(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body bodyModule
	raw := utils.ParseBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PUpdateModule, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

// module Components

func GetModuleComponents(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	result, err := user.Sql.ExecJson(constants.PGetModuleComponents, id)
	if err != nil {
		return httpmessage.Error(locale.SomethingBadHappened)
	}
	return httpmessage.Json(result)
}
