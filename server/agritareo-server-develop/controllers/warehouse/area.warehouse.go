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
//type areaBody struct {
//	Id     string `db:"idarea" json:"idarea"`
//	Nombre string `db:"nombre" json:"label" validate:"required"`
//	Estado bool   `db:"habilitado" json:"enabled"`
//}
//
//func GetArea(user *sts.Client) sts.HttpResponse {
//	var marca []areaBody
//	err := user.Sql.Select(&marca, `select id, nombre from TMAREA`)
//	if err != nil {
//		log.Println(err)
//	}
//	return httpmessage.Send(marca)
//}
//
//func PostArea(user *sts.Client, r *http.Request) sts.HttpResponse {
//	var body areaBody
//	raw := utils.ParseBody(r, &body)
//
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//
//	_, err := user.Sql.ExecJson(constants.PInsertArea, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	log.Println("Area Registrada")
//	return httpmessage.Log(raw)
//}
//
//func PutArea(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	var body areaBody
//	raw := utils.ParseBody(r, &body)
//	_, err := user.Sql.ExecJson(constants.PUpdateArea, user.CompanyId, id, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	return httpmessage.Log(raw)
//}
//
//func PatchArea(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	_, err := user.Sql.ExecJson(constants.PPatchArea, user.CompanyId, id)
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	return httpmessage.Empty()
//}
