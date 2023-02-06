package agritareo

import (
	"go.mongodb.org/mongo-driver/bson/bsontype"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
)

type geoZone struct {
	Id               int    `db:"id" json:"id,omitempty"`
	Description      string `db:"descripcion" json:"descripcion"`
	ShortDescription string `db:"descripcion_corta" json:"descripcion_corta"`
	Code             string `db:"codigo" json:"codigo"`
}

const (
	spGeo = "ZONA_GEOGRAFICA"
	tmGeo = "TMZONA_GEOGRAFICA"
)

func GetZone(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	i := utils.GetQuery(r, "items", "")
	p := utils.GetQuery(r, "page", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	result, err := user.Sql.Page(spGeo+"_L",
		user.CompanyId,
		i,
		p,
		s,
		o)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Page(
		result.Data,
		result.TotalFiltered,
		result.TotalRows,
	)
}

func GetZoneDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body []geoZone
	err := user.Sql.SelectProcedure(&body, spGeo+constants.DetailSuffix, user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	if len(body) > 0 {
		return httpmessage.Send(body[0])
	}
	return httpmessage.Send(body)
}

func CreateZone(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body geoZone
	raw := utils.ParseBody(r, &body)
	_, err := user.Sql.ExecJson(spGeo+"_I", user.CompanyId, bsontype.Null, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func UpdateZone(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body geoZone
	raw := utils.ParseBody(r, &body)
	_, err := user.Sql.ExecJson(spGeo+"_I", user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func DeleteZone(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(spGeo+"_D", user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}
