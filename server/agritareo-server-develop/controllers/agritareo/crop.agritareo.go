package agritareo

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
	"strings"
	"time"
)

type cropsBody struct {
	Id                    int         `db:"id" json:"id,omitempty"`
	Color                 *string     `db:"color" json:"color"`
	DescriptionScientific *string     `db:"descripcion_cientifica" json:"descripcion_cientifica"`
	DescriptionCrop       *string     `db:"descripcion_cultivo" json:"descripcion_cultivo"`
	Alias                 *string     `db:"alias" json:"alias,omitempty"`
	Code                  interface{} `db:"codigo" json:"codigo" validate:"required,notBlank"`
	Status                bool        `db:"estado" json:"estado,omitempty"`
	Preferences           *string     `db:"idpreferencias_cultivo" json:"idpreferencias_cultivo,omitempty"`
	Styles                *string     `db:"estilo" json:"estilo,omitempty"`
	Variety               interface{} `db:"variedad" json:"variedad"`
	PhenologyCrop         interface{} `db:"fenologias_cultivo" json:"fenologias_cultivo"`
}

type cropBody struct {
	Id             int         `db:"id" json:"id,omitempty"`
	Code           interface{} `db:"codigo" json:"codigo" validate:"required,notBlank"`
	Name           interface{} `db:"nombre" json:"nombre,omitempty"`
	NameCientifico interface{} `db:"nombrecientifico" json:"nombrecientifico,omitempty"`
	Alias          interface{} `db:"alias" json:"alias,omitempty"`
	Estado         bool        `db:"estado" json:"estado,omitempty"`
}

const (
	spCropVariety      = "CULTIVO_VARIEDAD" // ns_cultivo_variedad_f i l  d
	spCrop             = "CULTIVO"
	spPhenologyVariety = "FENOLOGIA_VARIEDAD"
	spx                = "ESTADO_FENOLOGICO_ZONAS_VARIEDAD"
)

func GetCrop(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	i := utils.GetQuery(r, "items", "")
	p := utils.GetQuery(r, "page", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	result, err := user.Sql.Page(spCropVariety+constants.ListSuffix,
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

func GetCropsTest(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var concept []cropBody
	err := user.Sql.Select(&concept, `select id, codigo, nombre, nombrecientifico, alias, estado  FROM TMCULTIVO`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(concept)
}

func GetCropDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body []cropsBody
	_ = utils.ParseBody(r, &body)
	err := user.Sql.SelectProcedure(&body, spCrop+constants.DetailSuffix, user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	if len(body) > 0 {
		pv := body[0]
		body[0].Variety = utils.ToJson(pv.Variety)
		body[0].PhenologyCrop = utils.ToJson(pv.PhenologyCrop)
		return httpmessage.Send(body[0])
	}
	return httpmessage.Send(body)
}

func CreateCrops(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body cropsBody
	raw := utils.ParseBody(r, &body)
	id, err := user.Sql.ExecJson(spCrop+constants.InsertUpdateSuffix,
		user.CompanyId,
		nil,
		utils.JsonString(body),
		user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(id, raw)
}

func UpdateCrops(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body cropsBody
	id := utils.GetIntVar(r, "id")
	raw := utils.ParseBody(r, &body)
	if valid, err := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, err)
	}
	_, err := user.Sql.ExecJson(spCrop+constants.InsertUpdateSuffix,
		user.CompanyId,
		id,
		utils.JsonString(body),
		user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func DeleteCrops(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(spCrop+constants.DeleteSuffix,
		user.CompanyId,
		id,
		user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

////////////////////////////
func GetPhenologyVariety(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	result, err := user.Sql.ExecJson(spPhenologyVariety+constants.DetailSuffix, id, user.UserId)
	if nil != err {
		return httpmessage.Error(err)
	}
	if len(result) != 0 {
		return httpmessage.Json(result)
	}
	return httpmessage.Send([]cropsBody{})
}

////////////// todo urrelo muevelo a otro fichero
type statusZoneVariety struct {
	Id                    *int        `db:"id" json:"id"`
	IdStatus              *int        `db:"idestado_fenologico" json:"idestado_fenologico"`
	IdPhenologicalVariety *int        `db:"idfenologia_variedad" json:"idfenologia_variedad"`
	PhenologicalVariety   *string     `db:"fenologia_variedad" json:"fenologia_variedad"`
	FirstDay              *int        `db:"dia_inicio" json:"dia_inicio"`
	LastDay               *int        `db:"dia_fin" json:"dia_fin"`
	Duration              *int        `db:"duracion_dias" json:"duracion_dias"`
	FirstDate             interface{} ` json:"fecha_inicio"`
	LastDate              interface{} ` json:"fecha_fin"`
	IdZone                *int        `db:"idzona_geografica" json:"idzona_geografica"`
}

// fechas mover a utils urrrelo
func FormatDate(fecha string) (t time.Time, e error) {
	NewDate := strings.Split(fecha, "T")
	layout := "2006-01-02"
	if len(NewDate) != 2 {
		e = errors.New("formato de fecha incorrecto")
		return
	}
	formatDate, err := time.Parse(layout, NewDate[0])
	if err != nil {
		e = err
		return
	}
	t = formatDate
	return
}

func GetZoneVarietyStatus(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	f := utils.GetQuery(r, "f", "").(string)
	v := utils.GetQuery(r, "v")
	z := utils.GetQuery(r, "z")

	firstDate, err := FormatDate(f)
	if err != nil {
		return httpmessage.Error(err)
	}
	var szv []statusZoneVariety
	err = user.Sql.SelectProcedure(&szv, spx+constants.DetailSuffix, z, v, user.UserId)
	if nil != err {
		return httpmessage.Error(err)
	}

	for j, i := range szv {
		// time
		hours := 24 * (*i.Duration)
		d, err := time.ParseDuration(fmt.Sprintf("%vh", hours))
		if err != nil {
			return httpmessage.Error(err)
		}
		szv[j].FirstDate = firstDate
		firstDate = firstDate.Add(d)
		szv[j].LastDate = firstDate
	}
	return httpmessage.Send(szv)
}
