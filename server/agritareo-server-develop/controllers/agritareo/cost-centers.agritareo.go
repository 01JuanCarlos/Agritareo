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
)

//type saveLotes struct {
//	Area        interface{} `json:"area"`
//	Codigo      interface{} `json:"codigo"`
//	Coordenadas []struct {
//		Latitud  interface{} `json:"latitud"`
//		Longitud interface{} `json:"longitud"`
//	} `json:"coordenadas"`
//	Idcentrocostopadre   interface{} `json:"idcentrocostopadre"`
//	Idcontrolador_riego  interface{} `json:"idcontrolador_riego"`
//	Idnivel              interface{} `json:"idnivel"`
//	Idnivelconfiguracion interface{} `json:"idnivelconfiguracion"`
//	Nombrenivel          interface{} `json:"nombrenivel"`
//	Parent_id            interface{} `json:"parent_id"`
//	Referencia           interface{} `json:"referencia"`
//	Siembra              []siembra   `json:"siembra,omitempty" validate:"required,dive,required"`
//	Valvulas             interface{} `json:"valvulas"`
//}

//type siembra struct {
//	Codigo_siembra string      `json:"codigo_siembra"`
//	Fecha_inicio   interface{} `json:"fecha_inicio"`
//	Fecha_fin      interface{} `json:"fecha_fin"`
//	Area_sembrada  interface{} `json:"area_sembrada"`
//	Idvariedad     interface{} `json:"idvariedad"`
//	Idcultivo      interface{} `json:"idcultivo"`
//	Cosecha        []cosecha   `json:"cosecha,omitempty" validate:"required,dive,required"`
//}

//type cosecha struct {
//	Codigo_cosecha   interface{} `json:"codigo_cosecha"`
//	Costo_proyectado interface{} `json:"costo_proyectado"`
//	Idcosecha        interface{} `json:"idcosecha"`
//	Idsiembra        interface{} `json:"idsiembra"`
//	Kilos_proyectado interface{} `json:"kilos_proyectado"`
//	Numero_plantas   interface{} `json:"numero_plantas"`
//	Campania         []campania  `json:"campania" validate:"required,dive,required"`
//}

//type campania struct {
//	Codigo_campania       interface{} `json:"codigo_campania"`
//	Fecha_fin_campania    interface{} `json:"fecha_fin_campania"`
//	Fecha_inicio_campania interface{} `json:"fecha_inicio_campania"`
//	Idcampania            interface{} `json:"idcampania"`
//	Anio                  interface{} `json:"anio" validate:"required,notBlank"`
//}

type campaingCostCenter struct {
	Id            int    `db:"id" json:"id,omitempty"`
	AnioCamp      *int   `db:"anio" json:"anio"`
	Codigo        string `db:"codigo" json:"codigo"`
	Description   string `db:"descripcion" json:"descripcion"`
	IdCultivo     int    `db:"idcultivo" json:"idcultivo"`
	NombreCultivo string `db:"nombre_cultivo" json:"nombre_cultivo"`
}

// EXEC NS_CENTROCOSTO_I @idempresa = 109, @id = null, @data = ''

const spCostCenter = "CENTROCOSTO"
const spCampaniaAgricola = "CAMPANIA"

//////////////////////////////////////////// Updated Controllers
type costCenter struct {
	Id                   int         `db:"id" json:"id,omitempty"`
	IdMainCostCenter     *int        `db:"idcentrocostopadre" json:"idcentrocostopadre"`
	IdLevelConfiguration *string     `db:"idnivelconfiguracion" json:"idnivelconfiguracion" validate:"required"`
	NameLevel            *string     `db:"nombrenivel" json:"nombrenivel"`
	IdCompany            string      `db:"idempresa" json:"idempresa"`
	Code                 string      `db:"codigo" json:"codigo"`
	Coordinates          interface{} `db:"coordenadas" json:"coordenadas"`
	AreaIn               *string     `db:"area_ingresada" json:"area_ingresada"`
	Area                 interface{} `db:"area_total" json:"area_total"`
	IdIrrigation         *string     `db:"idcontrolador_riego" json:"idcontrolador_riego" validate:"omitempty,notBlank"`
	Valves               interface{} `db:"valvulas" json:"valvulas"`
	IdLevel              interface{} `db:"idnivel" json:"idnivel"`
	Reference            interface{} `db:"referencia" json:"referencia"`
	Sowing               interface{} `db:"siembra" json:"siembra"`
	IdZone               *int        `db:"idzona_geografica" json:"idzona_geografica"`
	Lat                  *float64    `db:"latitud" json:"latitud"`
	Lng                  *float64    `db:"longitud" json:"longitud"`
	Hierarchy            interface{} `db:"jerarquia" json:"jerarquia"`
	CodeSync             interface{} `db:"codigo_sync" json:"codigo_sync "`
	FirstDate            *string     `db:"fecha_inicio" json:"fecha_inicio"`
	LastDate             *string     `db:"fecha_fin" json:"fecha_fin"`
}

/////////////////////////
func insertCoors(coordinates interface{}) interface{} {
	var init, query string
	if coordinates != nil && coordinates != "" {
		var first, last interface{}
		cc := coordinates.([]interface{})
		for i, j := range cc {
			d := j.(map[string]interface{}) // detail
			if i == 0 {
				first = d["latitud"]
				query = fmt.Sprintf(`%v %v`, d["longitud"], d["latitud"])
				init = query
			} else {
				if len(cc)-1 == i {
					last = d["latitud"]
				}
				query = fmt.Sprintf(`%v, %v %v`, query, d["longitud"], d["latitud"])
			}

		}

		if first != last {
			return fmt.Sprintf(`POLYGON((%v,%v))`, query, init)
		}
		return fmt.Sprintf(`POLYGON((%v))`, query)

	}
	return nil
}

///////////////////////////
func GetCostCenterOne(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	camp := utils.GetQuery(r, "campaign")
	cul := utils.GetQuery(r, "cultivo")
	p := utils.GetQuery(r, "page")
	i := utils.GetQuery(r, "items")
	s := utils.GetQuery(r, "search", "")
	result, err := user.Sql.Page(
		fmt.Sprintf(`%v`, spCostCenter+"_L"),
		user.CompanyId,
		camp,
		cul,
		i,
		p,
		s,
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

func GetCostCenter(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body []costCenter
	id := utils.GetIntVar(r, "id")
	err := user.Sql.SelectProcedure(&body, spCostCenter+constants.DetailSuffix, user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	if len(body) > 0 {
		b := body[0]
		body[0].Sowing = utils.ToJson(b.Sowing)
		body[0].Coordinates = utils.ToJson(b.Coordinates)
		return httpmessage.Send(body[0])
	}
	return httpmessage.Send(body)
}

func GetCostCenterCEZL(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body []costCenter
	err := user.Sql.SelectProcedure(&body, spCostCenter+"_APP", user.CompanyId, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	var i int
	for i < len(body) {
		b := body[i]
		body[i].Sowing = utils.ToJson(b.Sowing)
		body[i].Coordinates = utils.ToJson(b.Coordinates)
		i++
	}
/*	if len(body) > 0 {
		b := body[0]
		body[0].Sowing = utils.ToJson(b.Sowing)
		body[0].Coordinates = utils.ToJson(b.Coordinates)
		return httpmessage.Send(body[0])
	}*/
	return httpmessage.Send(body)
}

func UpdateCostCenter(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body costCenter
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	body.Coordinates = insertCoors(body.Coordinates)
	// test

	_, err := user.Sql.ExecJson(spCostCenter+"_I", user.CompanyId, id, utils.JsonString(body), user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func CreateCostCenter(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body costCenter
	raw := utils.ParseBody(r, &body)
	body.IdCompany = user.CompanyId
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	body.Coordinates = insertCoors(body.Coordinates)
	///////////////////////////
	result, err := user.Sql.ExecJson(spCostCenter+"_I", user.CompanyId, nil, utils.JsonString(body), user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(result, raw)
}

///////////////////////////////////////////

func GetCampaigns(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var Camp []campaingCostCenter
	err := user.Sql.SelectProcedure(&Camp, spCampaniaAgricola+"_L", user.CompanyId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(Camp)
}

// fixme to resultSet
//func GetCampaigns(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	var keys keysCostCenter
//	keys.IdCostCenter = utils.GetIntVar(r, "cid") // cost center ID
//	keys.IdSowing = utils.GetIntVar(r, "sid")
//	if valid, errors := validator.Validate(keys); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//
//	result, err := user.Sql.ExecJson(constants.PListCampania, user.CompanyId, utils.JsonString(keys))
//	if nil != err {
//		return httpmessage.Error(err)
//	}
//	return httpmessage.Json(result)
//}

//func CreateCampaigns(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	var body campaignBody
//	raw := utils.ParseBody(r, &body)
//	body.Keys.IdCostCenter = utils.GetIntVar(r, "cid") // cost center ID
//	body.Keys.IdSowing = utils.GetIntVar(r, "sid")
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//	if valid, errors := validator.FormatDateFail(body.FirstDate, body.HarvestDate, body.LastDate); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//	_, err := user.Sql.ExecJson(constants.PInsertCampania, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		return httpmessage.Error(err)
//	}
//	return httpmessage.Log(raw)
//}

//func UpdateCampaigns(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	var body campaignBody
//	raw := utils.ParseBody(r, &body)
//	body.Keys.IdCampaigns = utils.GetIntVar(r, "cam-id")
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//	if valid, errors := validator.FormatDateFail(body.FirstDate, body.HarvestDate, body.LastDate); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//	_, err := user.Sql.ExecJson(constants.PUpdateCampaigns, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		return httpmessage.Error(err)
//	}
//	return httpmessage.Log(raw)
//}

func PatchCampaigns(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "campid")
	_, err := user.Sql.ExecJson(constants.PPatchCampaigns, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

func DeleteCampaigns(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "campid")
	_, err := user.Sql.ExecJson(constants.PDeleteCampaigns, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

func DeleteCostCenter(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(spCostCenter+"_D", user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

//type binnacle struct {
//	Idbitacora          int           `json:"idbitacora"`
//	Area                float32       `json:"area"`
//	Fecha               string        `json:"fecha"`
//	Fecha_creacion      string        `json:"fecha_creacion"`
//	Glosa               string        `json:"glosa"`
//	Idcentro_costo      int           `json:"idcentro_costo"`
//	Usuario_creador     int           `json:"usuario_creador"`
//	Idmetodo_evaluacion int           `json:"idmetodo_evaluacion"`
//	MetodosEvaluacion   []interface{} `json:"metodos_evaluacion"`
//}
//
//type gdata struct {
//	Siembras          interface{} `db:"siembras" json:"siembras"`
//	CostCenter        interface{} `db:"centro_costos" json:"centro_costos"`
//	PuntoCultivo      interface{} `db:"punto_central" json:"punto_central"`
//	Cultivo           interface{} `db:"cultivos" json:"cultivos"`
//	Plagas            interface{} `db:"plagas" json:"plagas"`
//	Binnacle          interface{} `db:"bitacoras" json:"bitacoras"`
//	MetodosEvaluacion interface{} `db:"metodos_evaluacion" json:"metodos_evaluacion,omitempty"`
//}
//
//type me struct {
//	Id               int    `db:"id" json:"id"`
//	NameMethod       string `db:"nombre_metodo" json:"nombre_metodo"`
//	Number           string `db:"numero_entrada" json:"numero_entrada"`
//	NameM            string ` db:"nombre_medida" json:"nombre_medida"`
//	ShortNme         string `db:"nombre_corto" json:"nombre_corto"`
//	PhenologyName    string `db:"nombre_fenologia" json:"nombre_fenologia"`
//	DurationDays     int    `db:"duracion_dias" json:"duracion_dias"`
//	BajoA            string `db:"bajo_a" json:"bajo_a"`
//	BajoD            string `db:"bajo_d" json:"bajo_d"`
//	MedioA           string `db:"medio_a" json:"medio_a"`
//	MedioD           string `db:"medio_d" json:"medio_d"`
//	AltoA            string `db:"alto_a" json:"alto_a"`
//	AltoD            string `db:"alto_d" json:"alto_d"`
//	SubConcept       string `db:"subconcepto_evaluar" json:"subconcepto_evaluar"`
//	OrganoAfectado   string `db:"organo_afectado" json:"organo_afectado"`
//	Concept          string `db:"nombre_concepto" json:"nombre_concepto"`
//	NameCientifico   string `db:"nombre_cientifico" json:"nombre_cientifico"`
//	NameTipoconcepto string `db:"nombre_tipoconcepto" json:"nombre_tipoconcepto"`
//}

func GetGeneralData(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//var g []gdata
	//err := user.Sql.SelectProcedure(&g, "GDATA_L", user.CompanyId)
	result, err := user.Sql.ExecJson("GDATA_L", user.CompanyId)
	if err != nil {
		return httpmessage.Error(err)
	}

	//if len(g) > 0 {
	//
	//	rs := g[0]
	//
	//	var b []binnacle
	//	var m []me
	//
	//	if g[0].Binnacle != nil {
	//		_ = json.Unmarshal([]byte(g[0].Binnacle.(string)), &b)
	//		_ = json.Unmarshal([]byte(g[0].MetodosEvaluacion.(string)), &m)
	//	}
	//
	//	g[0].Siembras = utils.ToJson(rs.Siembras)
	//	g[0].CostCenter = utils.ToJson(rs.CostCenter)
	//	g[0].PuntoCultivo = utils.ToJson(rs.PuntoCultivo)
	//	g[0].Cultivo = utils.ToJson(rs.Cultivo)
	//	g[0].Plagas = utils.ToJson(rs.Plagas)
	//	g[0].Binnacle = b//utils.ToJson(rs.Binnacle)
	//	g[0].MetodosEvaluacion = m//utils.ToJson(rs.MetodosEvaluacion)

	//bn := g[0].Binnacle.([]binnacle)
	//mee := g[0].MetodosEvaluacion.([]me)
	//for z, i := range bn {
	//	for _, j := range mee {
	//		if i.Idmetodo_evaluacion == j.Id {
	//			bn[z].MetodosEvaluacion = append(bn[z].MetodosEvaluacion, j)
	//		}
	//	}
	//
	//}
	//g[0].Binnacle = bn
	//g[0].MetodosEvaluacion = nil

	//	return httpmessage.Send(g[0])

	//}

	return httpmessage.Json(result)
}
