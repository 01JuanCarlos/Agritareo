package warehouse

import (
	"net/http"
	"ns-api/business"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/util"
	"ns-api/locale"
)

//import (
//	"net/http"
//	"ns-api/business"
//	"ns-api/core/server"
//	"ns-api/core/sts"
//	"ns-api/core/util"
//	"ns-api/locale"
//)

//
//import (
//	"log"
//	"net/http"
//	"ns-api/business"
//	"ns-api/common/constants"
//	"ns-api/common/utils"
//	"ns-api/core/server"
//	"ns-api/core/sts"
//	"ns-api/core/util"
//	"ns-api/core/validator"
//	"ns-api/locale"
//)
//
//type documentBody struct {
//	Code       string `db:"codigo" json:"codigo"`
//	Label      string `db:"nombre" json:"label"`
//	DocumentID int    `db:"iddocumento" json:"iddocumento,omitempty"`
//}
//
//func PostDocument(user *sts.Client, r *http.Request) sts.HttpResponse {
//	var body documentBody
//	raw := utils.ParseBody(r, &body)
//
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//
//	_, err := user.MSql.ExecJson(constants.PInsertDocument, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Log(locale.SomethingBadHappened)
//	}
//	return httpmessage.Log(raw)
//}
//func PutDocument(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	var body documentBody
//	raw := utils.ParseBody(r, &body)
//	_, err := user.MSql.ExecJson(constants.PUpdateDocument, user.CompanyId, id, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Log(locale.SomethingBadHappened)
//	}
//	return httpmessage.Log(raw)
//}

func GetDocument(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//document := util.GetQuery("d", r).String()
	//component := util.GetQuery("c", r).String()
	//serie := util.GetQuery("s", r).String()
	cid := util.GetQuery("cid", r).String()

	sample, ok := business.Document.Sample(user, cid)
	if !ok {
		return httpmessage.Error(locale.DocumentNotFound)
	}
	//fmt.Println("sample ", sample)

	//docs := business.Document.Number(user, component, document, serie)

	//var body []documentSerie
	//dataBson := bson.M{
	//	"componente":  component,
	//	"iddocumento": document,
	//	"idserie":     serie,
	//}
	//err := user.MSql.SelectProcedure(&body, "DOCSERIE_L", user.CompanyId, utils.JsonString(dataBson))
	//if err != nil {
	//	logger.Debug(err)
	//	return httpmessage.Error(locale.SomethingBadHappened)
	//}
	return httpmessage.Send(sample)
}
