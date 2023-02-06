package warehouse

//type serieBody struct {
//	SerieID    int         `db:"idserie" json:"idserie,omitempty"`
//	DocumentID int         `json:"iddocumento,omitempty" validate:"required"`
//	Serie      string      `db:"serie" json:"serie" validate:"required"`
//	Number     interface{} `db:"numero" json:"numero" validate:"required"`
//}
//
//func PostSerie(user *sts.Client, r *http.Request) sts.HttpResponse {
//	var body serieBody
//	raw := utils.ParseBody(r, &body)
//
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//
//	_, err := user.Sql.ExecJson(constants.PInsertSerie, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.SomethingBadHappened)
//	}
//	return httpmessage.Log(raw)
//}
//func PutSerie(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	var body serieBody
//	raw := utils.ParseBody(r, &body)
//
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//
//	_, err := user.Sql.ExecJson(constants.PUpdateSerie, user.CompanyId, id, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.SomethingBadHappened)
//	}
//	return httpmessage.Log(raw)
//}
//
//func GetSerie(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	var body []serieBody
//	//result, err := db.ExecJson("DOCUMENTO_F", user.CompanyId, id)
//	err := user.Sql.SelectProcedure(&body, "SERIEDOCUMENTO_L", user.CompanyId, id)
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.SomethingBadHappened)
//	}
//	return httpmessage.Send(body)
//}
