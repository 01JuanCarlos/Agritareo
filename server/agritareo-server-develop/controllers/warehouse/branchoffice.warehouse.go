package warehouse

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
//type bracOfficehBody struct {
//	Id      string  `db:"idsucursal" json:"idsucursal"`
//	Nombre 	string  `db:"nombre" json:"label" validate:"required"`
//	Estado  bool 	`db:"habilitado" json:"enabled"`
//}
//
//func GetBrachOffice(user *sts.Client) sts.HttpResponse {
//	var marca []bracOfficehBody
//	err := user.Sql.Select(&marca, `select id, nombre from TMSUCURSAL`)
//	if err != nil {
//		return httpmessage.Error(err)
//	}
//	return httpmessage.Send(marca)
//}
//
//func PostBrachOffice(user *sts.Client, r *http.Request) sts.HttpResponse {
//	var body bracOfficehBody
//	raw := utils.ParseBody(r, &body)
//
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//
//	_, err := user.Sql.ExecJson(constants.PInsertBranchOffice, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	log.Println("Sucursal Registrada")
//	return httpmessage.Log(raw)
//}
//
//func PutBrachOffice(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	var body bracOfficehBody
//	raw := utils.ParseBody(r, &body)
//	_, err := user.Sql.ExecJson(constants.PUpdateBranchOffice, user.CompanyId, id, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	return httpmessage.Log(raw)
//}
//
//func PatchBrachOffice(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	_, err := user.Sql.ExecJson(constants.PPatchBranchOffice, user.CompanyId, id)
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	return httpmessage.Empty()
//}
