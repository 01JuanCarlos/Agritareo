package agritareo

import (
	"encoding/json"
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

type controllerIrrigation struct {
	Idcontrolador_riego int    `db:"idcontrolador_riego" json:"value"`
	Name                string `db:"nombre" json:"label"`
}

type phenologyStates struct {
	Name     string
	FirstDay int
}

type coordinates struct {
	IdLote      int         `db:"id" json:"id"`
	Codigo      interface{} `db:"codigo" json:"codigo"`
	NombreNivel interface{} `db:"nombrenivel" json:"nombrenivel"`
	Coordenadas interface{} `json:"coordenadas"`
	Lotes       interface{} `json:"lotes"`
}

func GetCampaign() {
	//fmt traer campanias

	//
}

func GetCampaignCrop() {

}

type CampaignAgricultural struct {
	Id          *int        `db:"id" json:"id,omitempty"`
	Code        *string     `db:"codigo" json:"codigo"`
	Description *string     `db:"descripcion" json:"descripcion"`
	Status      bool        `db:"estado" json:"estado"`
	Year        interface{} `db:"anio" json:"anio" validate:"required,notBlank,required"`
	IdCrop      *int        `db:"idcultivo" json:"idcultivo" validate:"required,notBlank"`
	MetaForm    interface{} `db:"meta_form" json:"meta_form,omitempty"`
}

func validateYear(year interface{}) error {
	// cambiar pa fechas completas
	value := fmt.Sprintf(`%v-01-19`, year)
	_, err := time.Parse("2006-01-02", value)
	if err != nil {
		return err
	}
	return nil
}

const spCampaignAgricultural = "CAMPANIA_AGRICOLA"

func GetIrrigationController(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body []controllerIrrigation
	query := fmt.Sprintf(`SELECT DISTINCT CC.idcontrolador_riego, CR.nombre FROM TMCENTROCOSTO CC 
			INNER JOIN TMCONTROLADOR_RIEGO CR ON CR.id = CC.idcontrolador_riego 
			where CC.idnivelconfiguracion = 13`)
	err := user.Sql.Select(&body, query)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(body)
}

func PhenologicalStates(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body []phenologyStates

	err := user.Sql.SelectProcedure(&body, "FENOLOGIA_VARIEDAD_L", user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(body)
}

//func CoordinatesAll(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	id := utils.GetIntVar(r, "id")
//	var body []coordinates
//	err := user.Sql.Select(&body, fmt.Sprintf("SELECT latitud, longitud from TMCENTROCOSTO WHERE id = %v",id))
//	if err != nil {
//		return httpmessage.Error(err)
//	}
//	if body != nil {
//		return httpmessage.Send(body[0])
//	}
//	return httpmessage.Send(body)
//}

func CoordinatesAll(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body []coordinates
	err := user.Sql.SelectProcedure(&body, constants.PlistLotes, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}

	for i, j := range body {
		if j.Lotes != nil {
			body[i].Lotes = json.RawMessage(j.Lotes.(string))
		}
	}
	//ASDASDASDASDASDAS
	if len(body) > 0 {
		return httpmessage.Send(body[0])
	}
	return httpmessage.Send(body)
}

// CAMPAÑAS AGRICOLAS

func GetCampaignAgricultural(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	i := utils.GetQuery(r, "items", "")
	p := utils.GetQuery(r, "page", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	result, err := user.Sql.Page(spCampaignAgricultural+"_L",
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

func GetCampaignAgriculturalDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body []CampaignAgricultural
	id := utils.GetIntVar(r, "id")
	err := user.Sql.SelectProcedure(&body, spCampaignAgricultural+"_F", user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	if len(body) > 0 {
		b := body[0]
		body[0].MetaForm = utils.ToJson(b.MetaForm)
		return httpmessage.Send(body[0])
	}
	return httpmessage.Send(body)
}

func CreateUpdateAgriculturalCampaign(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id, err := utils.GetIntVarIds(r, "id")
	if err != nil {
		return httpmessage.Error(locale.ValidationError)
	}
	var body CampaignAgricultural
	raw := utils.ParseBody(r, &body)
	body.Status = true

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	err = validateYear(body.Year)
	if err != nil {
		return httpmessage.Error(locale.ValidationError, "Fecha incorrecta")
	}
	result, err := user.Sql.ExecJson(spCampaignAgricultural+constants.InsertUpdateSuffix,
		user.CompanyId,
		id,
		utils.JsonString(body),
		user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(result, raw)
}

//func UpdateCampaignAgricultural(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	id := utils.GetIntVar(r, "id")
//	var body CampaignAgricultural
//	raw := utils.ParseBody(r, &body)
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//	_, err := user.Sql.ExecJson(spCampaignAgricultural+"_I", user.CompanyId, id, utils.JsonString(body), user.UserId)
//	if err != nil {
//		return httpmessage.Error(err)
//	}
//	return httpmessage.Log(raw)
//}

func DeleteCampaignAgricultural(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(spCampaignAgricultural+"_D", user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}
