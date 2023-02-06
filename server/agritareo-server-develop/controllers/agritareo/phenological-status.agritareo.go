package agritareo

import (
	"fmt"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
	"time"
)

type phenologyStatus struct {
	Id             int         `db:"id" json:"id,omitempty"`
	IdCultivo      int         `db:"idcultivo" json:"idcultivo"`
	IdZone         int         `db:"idzona_geografica" json:"idzona_geografica"`
	GeoZone        *string     `db:"zona_geografica" json:"zona_geografica"`
	Cultivo        *string     `db:"cultivo" json:"cultivo"`
	IdCropVariety  int         `db:"idcultivo_variedad" json:"idcultivo_variedad"`
	Variety        *string     `db:"variedad" json:"variedad"`
	FirstDate      interface{} `db:"fecha_inicio" json:"fecha_inicio"`
	FechaInicioDia *int        `db:"fecha_inicio_dia" json:"fecha_inicio_dia"`
	FechaInicioMes *int        `db:"fecha_inicio_mes" json:"fecha_inicio_mes"`
	Phenology      interface{} `db:"fenologias" json:"fenologias"`
	MetaForm       interface{} `db:"meta_form" json:"meta_form"` //Day           *int `db:"fecha_inicio_dia" json:"fecha_inicio_dia"`
	//Month          `db:"fecha_inicio_mes" json:"fecha_inicio_mes"`

}

const spPhenologicalStatus = "ESTADO_FENOLOGICO"

func GetPhenologicalStatus(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	p := utils.GetQuery(r, "page", "")
	i := utils.GetQuery(r, "items", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	result, err := user.Sql.Page(
		fmt.Sprintf(`%v`, spPhenologicalStatus+constants.ListSuffix),
		user.CompanyId,
		i,
		p,
		s,
		o,
	)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Page(
		result.Data,
		result.TotalFiltered,
		result.TotalRows,
	)
}

// detail
type fenologiastest struct {
	Id                   int         `json:"id"`
	Idestado_fenologico  int         `json:"idestado_fenologico"`
	Idfenologia_variedad int         `json:"idfenologia_variedad"`
	Fenologia_variedad   string      `json:"fenologia_variedad"`
	Dia_inicio           int         `json:"dia_inicio"`
	Dia_fin              int         `json:"dia_fin"`
	Fecha_inicio         interface{} `json:"fecha_inicio"`
	Fecha_fin            interface{} `json:"fecha_fin"`
}

func GetPhenologicalStatusDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body []phenologyStatus
	id := utils.GetIntVar(r, "id")

	err := user.Sql.SelectProcedure(&body, spPhenologicalStatus+constants.DetailSuffix, user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}

	if len(body) > 0 {
		b := body[0]
		//if d != "" {
		//
		//	layout := "02/01/2006"
		//	t, err := time.Parse(layout, d.(string))
		//	if err != nil {
		//		return httpmessage.Error("formato incorrectox")
		//	}
		//	fmt.Println(t)
		//	var res []fenologiastest
		//	json.Unmarshal([]byte(body[0].Phenology.(string)), &res)
		//
		//	body[0].FirstDate = t
		//	for k, _ := range res {
		//		res[k].Fecha_inicio = t
		//
		//		duration := res[k].Dia_fin - res[k].Dia_inicio
		//		t = t.AddDate(0, 0, duration)
		//
		//		res[k].Fecha_fin = t
		//	}
		//
		//	body[0].Phenology = res
		//validar sta wada
		year := time.Now().Year()
		body[0].FirstDate = time.Date(year, time.Month(*b.FechaInicioMes), *b.FechaInicioDia, 0, 0, 0, 0, time.UTC)
		body[0].Phenology = utils.ToJson(b.Phenology)
		body[0].MetaForm = utils.ToJson(b.MetaForm)
		return httpmessage.Send(body[0])
	}
	return httpmessage.Send(body)
}

func CreatePhenologicalStatus(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body phenologyStatus
	raw := utils.ParseBody(r, &body)
	id, err := user.Sql.ExecJson(spPhenologicalStatus+constants.InsertUpdateSuffix,
		user.CompanyId,
		nil,
		utils.JsonString(body),
		user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(id, raw)
}

func UpdatePhenologicalStatus(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body phenologyStatus
	id := utils.GetIntVar(r, "id")
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(spPhenologicalStatus+constants.InsertUpdateSuffix,
		user.CompanyId,
		id,
		utils.JsonString(body), user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func DeletePhenologicalStatus(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(spPhenologicalStatus+"_D", user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}
