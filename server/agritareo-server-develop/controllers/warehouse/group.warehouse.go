package warehouse

//import (
//	"net/http"
//	"ns-api/common/constants"
//	"ns-api/common/utils"
//	"ns-api/core/server"
//	"ns-api/core/sts"
//	"ns-api/core/validator"
//	"ns-api/locale"
//)
//
//type groupBody struct {
//	Id        int    `db:"idgrupo" json:"id,omitempty"`
//	Name      string `db:"nombre" json:"label" validate:"required"`
//	Enabled   bool   `db:"habilitado" json:"enabled"`
//	TypeGroup string `db:"tipo_grupo" json:"tipo_grupo" validate:"required,max=1"`
//}
//
//func PostGroup(user *sts.Client, r *http.Request) sts.HttpResponse {
//	var body groupBody
//	raw := utils.ParseBody(r, &body)
//	_, err := user.MSql.ExecJson(constants.PInsertGroup, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		//log.Println(err)
//		return httpmessage.Error(locale.SomethingBadHappened)
//	}
//	//log.Println("Grupo Registrado")
//	return httpmessage.Log(raw)
//}
//
//func PutGroup(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	var body groupBody
//	raw := utils.ParseBody(r, &body)
//
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//
//	_, err := user.MSql.ExecJson(constants.PUpdateGroup, user.CompanyId, id, utils.JsonString(body))
//	if err != nil {
//		//log.Println(err)
//		return httpmessage.Error(locale.SomethingBadHappened)
//	}
//	return httpmessage.Log(raw)
//}
