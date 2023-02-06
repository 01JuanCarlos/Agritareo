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
//type stateBody struct {
//	Id          float32 `db:"idmarca" json:"idestado"`
//	Nombre      string  `db:"nombre" json:"label" validate:"required"`
//	NombreCorto string  `db:"nombre_corto" json:"shortname"`
//	Color       string  `db:"color" json:"color"`
//	Estado      bool    `json:"enabled"`
//}
//
//func GetState(user *sts.Client) sts.HttpResponse {
//	var marca []stateBody
//	err := user.Sql.Select(&marca, `select id, nombre from TMESTADO`)
//	if err != nil {
//		log.Println(err)
//	}
//	return httpmessage.Send(marca)
//}
//
//func PostState(user *sts.Client, r *http.Request) sts.HttpResponse {
//	var body stateBody
//	raw := utils.ParseBody(r, &body)
//
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//
//	_, err := user.Sql.ExecJson(constants.PInsertState, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	log.Println("Estado Registrado")
//	return httpmessage.Log(raw)
//}
//
//func PutState(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	var body stateBody
//	raw := utils.ParseBody(r, &body)
//	_, err := user.Sql.ExecJson(constants.PUpdateState, user.CompanyId, id, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	return httpmessage.Log(raw)
//}
//
//func PatchState(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	_, err := user.Sql.ExecJson(constants.PPatchState, user.CompanyId, id)
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	return httpmessage.Empty()
//}
