package agritareo

import (
	"fmt"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/controllers/agritareo/entity/binnacle"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
	"time"
)

type harvest struct {
	Id              int         `db:"id" json:"id,omitempty"`
	Numero          string      `db:"numero" json:"numero" validate:"required,empty"`
	FechaInicio     interface{} `db:"fecha_inicio" json:"fecha_inicio" validate:"required,empty"`
	FechaFin        interface{} `db:"fecha_fin" json:"fecha_fin" validate:"required,empty"`
	NumeroPlantas   interface{} `db:"numero_plantas" json:"numero_plantas"`
	KiloProyectado  interface{} `db:"kilos_proyectado" json:"kilos_proyectado"`
	CostoProyectado interface{} `db:"costo_proyectado" json:"costo_proyectado"`
	IdCampania      int         `db:"idcampania" json:"idcampania"`
}

const (
	spHarvestReport         = "REPORTE_BITACORA_COSECHA"
)

func GetHarvest(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body []harvest
	id := utils.GetIntVar(r, "cid")
	query := fmt.Sprintf(`
		SELECT C.id, C.numero, C.fecha_inicio, C.fecha_fin,C.numero_plantas, C.kilos_proyectado,
		C.costo_proyectado,  C.idcampania
		FROM TMCOSECHA C 
		INNER JOIN TMCAMPANIA CA ON CA.id = C.idcampania
		INNER JOIN TMSIEMBRA S ON S.id = CA.idsiembra
		WHERE S.idempresa = %v and C.idcampania = %v
	`, user.CompanyId, id)
	logger.Debug(query)
	err := user.Sql.Select(&body, query)
	if err != nil {
		httpmessage.Error(err)
	}
	return httpmessage.Send(body)
}

func CreateHarvest(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body harvest
	raw := utils.ParseBody(r, &body)
	body.IdCampania = utils.GetIntVar(r, "cid")
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	if valid, errors := validator.FormatDateFail(body.FechaInicio, body.FechaFin); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PInsertHarvest, user.CompanyId, utils.JsonString(body))
	if err != nil {
		httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func UpdateHarvest(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body harvest
	raw := utils.ParseBody(r, &body)
	body.IdCampania = utils.GetIntVar(r, "cid")
	_, err := user.Sql.ExecJson(constants.PUpdateHarvest, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func DeleteHarvest(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(constants.PDeleteHarvest, user.CompanyId, id)
	if err != nil {
		httpmessage.Error(err)
	}
	return httpmessage.Empty()
}


//reporte de cosecha

func GetHarvestReport(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//var f1, f2 interface{}
	var pd binnacle.PhytosanityDates
	pd.FechaInicio = utils.GetQuery(r, "i", "").(string)
	pd.FechaFin = utils.GetQuery(r, "f", "").(string)
	if pd.FechaInicio != "" || pd.FechaFin != "" {
		err := pd.Validate()
		if err != nil {
			return httpmessage.Error(err)
		}
	} else {
		fechanow := time.Now()
		// utilizar este por si quiero hacer de un año atras
		//fechalast := fechanow.AddDate(0,0,0)
		pd.FechaFin = fmt.Sprintf(`%v/%v/%v`, fechanow.Year(), int(fechanow.Month()), fechanow.Day())
		pd.FechaInicio = fmt.Sprintf(`%v/%v/%v`, fechanow.Year(), int(fechanow.Month()), 1)
	}
	fmt.Println(pd)
	result, err := user.Sql.ExecJson(spHarvestReport+constants.DetailSuffix,
		user.CompanyId,
		user.UserId,
		pd.FechaInicio,
		pd.FechaFin)
	if err != nil {
		fmt.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}