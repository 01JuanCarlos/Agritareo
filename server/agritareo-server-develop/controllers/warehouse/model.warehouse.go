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
//type modeloBody struct {
//	Id     float32 `db:"idmodelo" json:"idmodelo,omitempty"`
//	Nombre string  `db:"nombre" json:"descripcion" validate:"required"`
//	Estado string  `json:"status,omitempty"`
//}
//
//func GetModel(user *sts.Client) sts.HttpResponse {
//	var model []modeloBody
//	err := user.Sql.Select(&model, `select id, nombre from TMMODELO`)
//	if err != nil {
//		log.Println(err)
//	}
//	return httpmessage.Send(model)
//}
//
//func PostModel(user *sts.Client, r *http.Request) sts.HttpResponse {
//
//	var body modeloBody
//	raw := utils.ParseBody(r, &body)
//
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//
//	_, err := user.Sql.ExecJson(constants.PInsertModel, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	log.Println("Marca Registrada")
//	return httpmessage.Log(raw)
//}
//
//func PutModel(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	var body modeloBody
//	raw := utils.ParseBody(r, &body)
//	_, err := user.Sql.ExecJson(constants.PUpdateModel, user.CompanyId, id, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	return httpmessage.Log(raw)
//}
//
//func PatchModel(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	_, err := user.Sql.ExecJson(constants.PPatchModel, user.CompanyId, id)
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	return httpmessage.Empty()
//}
