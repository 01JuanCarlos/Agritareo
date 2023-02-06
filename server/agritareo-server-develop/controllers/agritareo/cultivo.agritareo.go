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

type cropsPlague struct {
	IdCultivo  int `json:"idcultivo" validate:"required,empty,number"`
	IdVariedad int `json:"idvariedad" validate:"required,empty,number"`
	IdPlaga    int `json:"idplaga" validate:"required,empty,number"`
}

type cropsPhenology struct {
	IdCultivo   int `json:"idcultivo" validate:"required,empty,number"`
	IdVariedad  int `json:"idvariedad" validate:"required,empty,number"`
	IdFenologia int `json:"idfenologia,ommitempty"`
}

type cropsPhenologyL struct {
	Id        int    `json:"id" validate:"required,empty,number"`
	Name      string `db:"nombre" json:"nombre" validate:"required,notBlank"`
	Code      string `db:"codigo" json:"codigo"`
	Order     int    `db:"orden" json:"orden,omitempty"`
	Days      int    `db:"duracion_dias" json:"duracion_dias"`
	DiaInicio int    `json:"dia_inicio,omitempty"`
	DiaFin    int    `json:"dia_fin,omitempty"`
}

func UpdateStatusCrops(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(constants.UpdateStatusCrops, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	//FIXME: SEND LOG
	return httpmessage.Empty()
}

func AssignPlagueCrops(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body cropsPlague
	raw := utils.ParseBody(r, &body)
	body.IdCultivo = utils.GetIntVar(r, "id")
	body.IdVariedad = utils.GetIntVar(r, "vid")
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PInsertPlagueCrops, user.CompanyId, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func GetVarieties(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var phenology []cropsPhenologyL
	err := user.Sql.SelectProcedure(&phenology, constants.PListPhenologyCultivoVariedad, user.CompanyId, id)
	if nil != err {
		return httpmessage.Error(err)
	}
	var days int
	for i, j := range phenology {
		if i == 0 {
			phenology[i].DiaInicio = 1
		} else {
			phenology[i].DiaInicio = days + 1
		}
		days = days + j.Days
		phenology[i].DiaFin = days
	}
	return httpmessage.Send(phenology)
}

func UpdateAssignPhenologyByVariety(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "fid")
	_, err := user.Sql.ExecJson(constants.UpdateAssignPhenologyVariety, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	//FIXME: SEND LOG
	return httpmessage.Empty()
}

func UpdateAssignPlagueByVariety(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "pid")
	_, err := user.Sql.ExecJson(constants.PUpdateAssignPlagueCrops, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	//FIXME: SEND LOG
	return httpmessage.Empty()
}

func AssignPhenologyCrops(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body cropsPhenology
	raw := utils.ParseBody(r, &body)
	body.IdCultivo = utils.GetIntVar(r, "id")
	body.IdVariedad = utils.GetIntVar(r, "vid")
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	// ------------------------------- 		SELECT COUNT(*) FROM TMFENOLOGIA_VARIEDAD_CULTIVO
	var count int
	rows, err := user.Sql.Query(fmt.Sprintf(`
		SELECT TOP 1 orden FROM  TMFENOLOGIA_VARIEDAD_CULTIVO
		WHERE idvariedad = '%v' AND idcultivo = '%v'  ORDER BY orden DESC`,
		body.IdVariedad,
		body.IdCultivo))
	if err != nil {
		return httpmessage.Error(err)
	}
	for rows.Next() {
		if err := rows.Scan(&count); err != nil {
			return httpmessage.Error(err)
		}
	}
	count = count + 1

	query := fmt.Sprintf(`
		INSERT INTO TMFENOLOGIA_VARIEDAD_CULTIVO (
		idfenologia, idvariedad,idcultivo,estado, orden)
		values(%v, %v, %v, 1, %v)
	`, body.IdFenologia,
		body.IdVariedad,
		body.IdCultivo,
		count)
	_, err = user.Sql.Query(query)
	if err != nil {
		return httpmessage.Error(constants.MatchError(err.Error()))
	}
	return httpmessage.Log(raw)
}

func DeletePlagueCrops(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "pid")
	_, err := user.Sql.ExecJson(constants.PDeletePlaga, user.CompanyId, id)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

func DeleteAssignPlagueCrops(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var keys cropsPlague
	keys.IdCultivo = utils.GetIntVar(r, "id")
	keys.IdVariedad = utils.GetIntVar(r, "vid")
	keys.IdPlaga = utils.GetIntVar(r, "pid")
	if valid, errors := validator.Validate(keys); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.DeleteAssignPlagueCrops, user.CompanyId, keys.IdCultivo, keys.IdVariedad, keys.IdPlaga)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

func DeleteAssignPhenologyVariety(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var keys cropsPhenology
	keys.IdCultivo = utils.GetIntVar(r, "id")
	keys.IdVariedad = utils.GetIntVar(r, "vid")
	keys.IdFenologia = utils.GetIntVar(r, "fid")
	if valid, errors := validator.Validate(keys); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.DeleteAssignPhenologyVariety, user.CompanyId, keys.IdCultivo, keys.IdVariedad, keys.IdFenologia)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

// FENOLOGIAS X VARIEDAD (VISTA METODO DE EVALUACIÓN)
