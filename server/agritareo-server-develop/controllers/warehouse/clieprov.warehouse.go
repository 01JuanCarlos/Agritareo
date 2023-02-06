package warehouse
//
//import (
//	"log"
//	"net/http"
//	"ns-api/common/constants"
//	"ns-api/common/utils"
//	"ns-api/core/server"
//	"ns-api/core/sts"
//	"ns-api/core/validator"
//	"ns-api/locale"
//)
//
//type clieprovBody struct {
//	// ClieprovID  interface{} `json:"idproducto" validate:"required"`
//	Code            interface{} `json:"codigo" validate:"required"`
//	ApellidoPaterno string      `json:"apellido_paterno"`
//	ApellidoMaterno string      `json:"apellido_materno"`
//	Name            string      `json:"nombre" validate:"required"`
//	Phone           string      `json:"telefono"`
//	Email           string      `json:"correo"`
//}
//
//func PostClieprov(user *sts.Client, r *http.Request) sts.HttpResponse {
//	var body clieprovBody
//	raw := utils.ParseBody(r, &body)
//
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//
//	_, err := user.Sql.ExecJson(constants.PInsertClieprov, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.SomethingBadHappened)
//	}
//	return shttpmessage.Log(raw)
//}
//
//func PutClieprov(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	var body clieprovBody
//	raw := utils.ParseBody(r, &body)
//
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//
//	_, err := user.Sql.ExecJson(constants.PUpdateClieprov, user.CompanyId, id, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.SomethingBadHappened)
//	}
//	return httpmessage.Log(raw)
//}
