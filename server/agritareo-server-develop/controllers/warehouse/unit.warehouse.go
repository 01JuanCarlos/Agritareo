package warehouse

//import (
//	"log"
//	"net/http"
//	"ns-api/common/constants"
//	"ns-api/common/logger"
//	"ns-api/common/utils"
//	"ns-api/config"
//	"ns-api/core/server"
//	"ns-api/core/sts"
//	"ns-api/core/validator"
//	"ns-api/locale"
//)
//
//type unitBody struct {
//	Id          float32 `db:"idmedida" json:"id"`
//	Name        string  `db:"nombre" json:"label" validate:"required"`
//	NombreCorto string  `db:"nombre_corto" json:"shortname" validate:"required"`
//	//Estado      bool    `json:"enabled"`
//	TransactionUID string `json:"transaction_uid"`
//}
//
//func GetUnit(user *sts.Client) sts.HttpResponse {
//	var unit []unitBody
//	err := user.Sql.Select(&unit, `select id, nombre from TMUNIMEDIDA where habilitado=1`)
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.SomethingBadHappened)
//	}
//	return httpmessage.Send(unit)
//}
////FIXME INSERT TRANSACTION UID
//func PostUnit(user *sts.Client, r *http.Request) sts.HttpResponse {
//	var body unitBody
//	_ = utils.ParseBody(r, &body)
//	body.TransactionUID = r.Header.Get(config.TransactionHeader)
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//	_, err := user.Sql.ExecJson(constants.PInsertUnit, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		return httpmessage.Error(err)
//	}
//	// fixme log sin id
//	return httpmessage.Log(body)
//
//}
//
//func PutUnit(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	var body unitBody
//	_ = utils.ParseBody(r, &body)
//	_, err := user.Sql.ExecJson(constants.PUpdateUnit, user.CompanyId, id, utils.JsonString(body))
//	if err != nil {
//		logger.Debug(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	return httpmessage.Log(body)
//}
