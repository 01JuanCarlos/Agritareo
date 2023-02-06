package agritareo

import (
	"log"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
)

// FIXME: remover struct
type fenologiaBody struct {
	Id              int         `db:"id" json:"id,omitempty"`
	IdCultivo       int         `db:"idcultivo" json:"idcultivo,omitempty" validate:"required,empty,number"`
	NombreFenologia string      `db:"nombre" json:"nombre" validate:"required,empty"`
	Codigo          string      `db:"codigo" json:"codigo"`
	DiaInicio       interface{} `db:"diainicio" json:"diainicio,omitempty"`
	DiaFin          interface{} `db:"diafin" json:"diafin,omitempty" `
	Dias            interface{} `db:"dias" json:"dias,omitempty" validate:"required,empty,number"`
	Estado          bool        `db:"estado" json:"estado"` // fail validation bool
}

type cropsPhenologyF struct {
	ID     interface{} `json:"id" validate:"required,empty,number"`
	Nombre string      `json:"nombre" validate:"required,empty"`
	Codigo string      `json:"codigo"`
	Dias   interface{} `db:"dias" json:"dias,omitempty" validate:"required,empty,number"`
}

type umbralJsonBody struct {
	IdSubEtiqueta int         `db:"idsubetiqueta" json:"idsubetiqueta"`
	IdFenologia   int         `db:"idfenologia" json:"idfenologia"`
	Data          interface{} `json:"umbrales"`
}

func CreatePhenology(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body cropsPhenologyF
	raw := utils.ParseBody(r, &body)
	body.ID = utils.GetIntVar(r, "id")
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PInsertFenologia,
		user.CompanyId,
		utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func UpdatePhenology(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body fenologiaBody
	raw := utils.ParseBody(r, &body)
	body.Id = utils.GetIntVar(r, "fid")
	body.IdCultivo = utils.GetIntVar(r, "id")
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PUpdateFenologia, user.CompanyId, body.Id, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func DeletePhenology(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "fid")
	_, err := user.Sql.ExecJson(constants.PDeleteFenologia, user.CompanyId, id)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

func PostUmbral(user *sts.Client, r *http.Request) *sts.HttpResponse {
	var body umbralJsonBody
	raw := utils.ParseBody(r, &body)
	//fmt.Println("fail", body)

	if valid, errors := validator.Validate(body); !valid {
		return server.ErrorMessage(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PInsertUmbral, body.IdSubEtiqueta, body.IdFenologia, body.Data)
	if err != nil {
		log.Println(err)
		return server.ErrorMessage(err)
	}
	//log.Println("Sucursal Registrada")
	return server.EmptyMessage(raw)
}

func StatusPhenologyVariety(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "fid")
	_, err := user.Sql.ExecJson(constants.UpdatePhenologyCrops, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	//FIXME: SEND LOG
	return httpmessage.Empty()
}

// ------- update
//C.id,
//C.nombre AS 'descripcion_cultivo',
//C.alias,
//C.codigo,
//C.nombrecientifico AS 'descripcion_cientifica',
//C.estado,
//CP.id AS 'idpreferencias_cultivo',
//CP.color,
//CP.estilo,
const spCultivo = "CULTIVO"

type updatePhenology struct {
	Id                    *int        `db:"id" json:"id"`
	DescripcionCultivo    *string     `db:"descripcion_cultivo" json:"descripcion_cultivo"`
	Alias                 *string     `db:"alias" json:"alias"`
	Codigo                *string     `db:"codigo" json:"codigo"`
	DescripcionCientifica *string     `db:"descripcion_cientifica" json:"descripcion_cientifica"`
	Status                *bool       `db:"estado" json:"estado"`
	IdPreferenciasCultivo *int        `db:"idpreferencias_cultivo" json:"idpreferencias_cultivo"`
	Color                 *string     `db:"color" json:"color"`
	Estilo                interface{} `db:"estilo" json:"estilo"`
	FenologiasCultivo     interface{} `db:"fenologias_cultivo" json:"fenologias_cultivo"`
	Variedad              interface{} `db:"variedad" json:"variedad"`
}

func GetCropsPhenology(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var phenology []updatePhenology
	err := user.Sql.SelectProcedure(&phenology, spCultivo+"_F", user.CompanyId, id)
	if nil != err {
		return httpmessage.Error(err)
	}

	if len(phenology) > 0 {
		pv := phenology[0]
		phenology[0].Variedad = utils.ToJson(pv.Variedad)
		phenology[0].FenologiasCultivo = utils.ToJson(pv.FenologiasCultivo)
		return httpmessage.Send(phenology[0])
	}
	return httpmessage.Send(phenology)
}
