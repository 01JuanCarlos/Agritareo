package warehouse
//
//import (
//	"log"
//	"net/http"
//	"ns-api/common/constants"
//	"ns-api/common/utils"
//	"ns-api/config"
//	"ns-api/core/server"
//	"ns-api/core/sts"
//	"ns-api/core/validator"
//	"ns-api/locale"
//)
//
//type currencyBody struct {
//	ID             string `json:"codigo" validate:"required,max=3"`
//	Label          string `json:"label" validate:"required"`
//	TransactionUID string `json:"transaction_uid,omitempty"`
//}
//
//func PostCurrency(user *sts.Client, r *http.Request) sts.HttpResponse {
//	var body currencyBody
//	_ = utils.ParseBody(r, &body)
//	body.TransactionUID =  r.Header.Get(config.TransactionHeader)
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//	_, err := user.Sql.ExecJson(constants.PInsertCurrency, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		return httpmessage.Error(locale.SomethingBadHappened)
//	}
//	// fixme log sin id
//	return httpmessage.Log(body)
//}
//func PutCurrency(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	var body currencyBody
//	_ = utils.ParseBody(r, &body)
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//	_, err := user.Sql.ExecJson(constants.PUpdateCurrency, user.CompanyId, id, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(body)
//	}
//	return httpmessage.Log(body)
//}
