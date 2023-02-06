package controllers

import (
	"fmt"
	"net/http"
	"ns-api/business"
	"ns-api/common/logger"
	"ns-api/config"
	"ns-api/core/errors"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
)

func PostMntHandler(user *sts.Client, r *sts.HttpRequest) (httpmessage.HttpMessage, error) {
	id := r.Query.Get(config.IdKey).String()
	body := r.GetBody()
	if body == nil { // TODO: Validar si el cuerpo está vacio.
		return nil, errors.MissingFieldsError
	}

	result, err := business.Maintainer.Save(user, id, body)

	if nil != err {
		return nil, err
	}

	return httpmessage.Send(result), nil
}

func PutMntHandler(user *sts.Client, r *sts.HttpRequest) (err error) {
	//key := utils.GetIntVar(r,"id")
	//id := utils.GetQuery(r, "id").(string)
	//var body map[string]interface{}
	//_ = utils.ParseBody(r, &body)
	key := r.Params.Get(config.IdKey).Int()
	id := r.Query.Get(config.IdKey).String()
	body := r.GetBody()
	body["idempresa"] = user.CompanyId
	err = user.Sql.PutMnt(id, user.CompanyId, body, key)
	if err != nil {
		logger.Debug(err)
		return err
	}
	return
}

func PatchMntHandler(user *sts.Client, r *sts.HttpRequest) (httpmessage.HttpMessage, error) {
	id := r.Params.Get(config.IdKey).String()
	cid := r.Query.Get(config.IdKey).String()
	body := r.GetBody()

	fmt.Println("Disable...", id, cid)

	if body == nil {
		return httpmessage.Send(body),nil
		//result, err := maintainerBusiness.MtBusinnes.AutoExecDis(user, cid, id)
		//if err != nil {
		//	logger.Debug(err)
		//	return httpmessage.Error(err)
		//}
		//var body = map[string]interface{}{
		//	"habilitado": result,
		//	"id":         id,
		//}
		//return httpmessage.(body)
	}

	if body == nil {
		return nil, errors.MissingFieldsError
	}

	//body.Set(config.CompanyIdKey, user.CompanyId)

	result, err := business.Maintainer.Update(user, id, cid, body)

	if nil != err {
		return nil, err
	}

	return httpmessage.Send(result), nil
}

func DeleteMntHandler(user *sts.Client, r *sts.HttpRequest) error {
	id := r.Params.Get(config.IdKey).String()
	cid := r.Query.Get(config.IdKey).String()

	res, err := business.Maintainer.Delete(user, id, cid)

	if nil != err {
		return err
	}

	fmt.Println("Delete ", res, err)

	return nil
	//var body = make(map[string]interface{})
	//body["id"] = id
	//err := maintainerBusiness.MtBusinnes.AutoExecDel(user, cid, id)
	//
	//if err != nil {
	//	rs, _ := business.RegisterExists.ExistsMt(user, cid, id)
	//	return httpmessage.Error(locale.SomethingBadHappened, err.Error(), rs)
	//}
	//return httpmessage.Log(body)
}

func GetIdMntHandler(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//id := utils.GetIntVar(r, "id")              // ID to delete
	//cid := utils.GetQuery(r, "id", "").(string) //  cid
	//result, meta, err := maintainerBusiness.MtBusinnes.AutoExecSelect(user, cid, id)
	//if err != nil {
	//	return httpmessage.Error(err)
	//}
	//return httpmessage.Page(result, &sts.HttpMetaResponse{
	//	RecordsFiltered: meta.RecordsFiltered,
	//	RecordsTotal:    meta.RecordsFiltered,
	//	ProcedureData:   meta.ProcedureData,
	//})
	// fixme: descomentar
	return httpmessage.Empty()
}

//func DisabledMntHandler(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetIntVar(r, "id")
//	cid := utils.GetQuery(r, "id", "").(string)
//	result, err := maintainerBusiness.MtBusinnes.AutoExecDis(user, cid, id)
//	if err != nil {
//		logger.Debug(err)
//		return httpmessage.Error(err)
//	}
//	var body = map[string]interface{}{
//		"habilitado": result,
//		"id":         id,
//	}
//	return httpmessage.Log(body)
//}
