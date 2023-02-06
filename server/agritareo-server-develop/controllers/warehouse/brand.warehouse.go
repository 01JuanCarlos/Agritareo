package warehouse

//type marcaBody struct {
//	Id     float32 `db:"idmarca" json:"idmarca,omitempty"`
//	Nombre string  `db:"nombre" json:"label"`
//	Estado bool    `json:"enabled"`
//}
//
//func GetBrand(user *sts.Client) sts.HttpResponse {
//	var marca []marcaBody
//	err := user.Sql.Select(&marca, `select id, nombre from TMMARCA`)
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.SomethingBadHappened)
//	}
//	return httpmessage.Send(marca)
//}
//
//func PostBrand(user *sts.Client, r *http.Request) sts.HttpResponse {
//	var body marcaBody
//	raw := utils.ParseBody(r, &body)
//	_, err := user.Sql.ExecJson(constants.PInsertBrand, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.SomethingBadHappened)
//	}
//	log.Println("Marca Registrada")
//	return httpmessage.Log(raw)
//}
//
//func PutBrand(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	var body marcaBody
//	raw := utils.ParseBody(r, &body)
//	_, err := user.Sql.ExecJson(constants.PUpdateBrand, user.CompanyId, id, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.SomethingBadHappened)
//	}
//	return httpmessage.Log(raw)
//}
//
//func PatchBrand(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	_, err := user.Sql.ExecJson(constants.PPatchBrand, user.CompanyId, id)
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.SomethingBadHappened)
//	}
//	return httpmessage.Empty()
//}
