package warehouse

import (
	"net/http"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/config"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
)
// add all fields
type reception struct {
	TransactionUID  string `json:"transaction_uid,omitempty"`
}

func PostReceptionGuide(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body reception
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	body.TransactionUID = r.Header.Get(config.TransactionHeader)
	// add name sp
	_, err := user.Sql.ExecJson("", user.CompanyId, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func PutReceptionGuide(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body reception
	id := utils.GetVar(r, "id")
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson("", user.CompanyId, id)
	if err != nil {
		logger.Debug(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

