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
)

type concept struct {
	Id            int         `db:"id" json:"id,omitempty"`
	TypeConceptId int         `db:"idtipo_concepto" json:"idtipo_concepto" validate:"required,notBlank"`
	TypeConcept   interface{} `db:"tipo_concepto" json:"tipo_concepto"`
	Code          *string     `db:"codigo" json:"codigo" validate:"required,notBlank"`
	Name          *string     `db:"nombre" json:"nombre" validate:"required,notBlank"`
	Description   *string     `db:"descripcion" json:"descripcion"`
	NameF         *string     `db:"nombre_cientifico" json:"nombre_cientifico"`
	SubConcept    interface{} `db:"subconceptos_agricola" json:"subconceptos_agricola"`
	MetaForm      interface{} `db:"meta_form" json:"meta_form"`
}

type subConcept struct {
	Id          *int                   `json:"id" validate:"omitempty,notBlank"`
	Crop        *string                `json:"cultivo" validate:"omitempty,notBlank"`
	IdConcept   *int                   `json:"idconcepto_agricola" validate:"omitempty,notBlank"`
	IdCrop      *int                   `json:"idcultivo" validate:"required,notBlank"`
	Evaluations []evaluationSubConcept `json:"evaluaciones_subconcepto" validate:"dive"`
}

type evaluationSubConcept struct {
	Id                 *int    `json:"id" validate:"omitempty,notBlank"`
	IdConceptCrop      *int    `json:"idconcepto_cultivo" validate:"omitempty,notBlank"`
	IdEvaluationMethod *int    `json:"idmetodo_evaluacion" validate:"omitempty,notBlank"`
	IdSubConcept       *int    `json:"idsubconcepto_agricola" validate:"omitempty,notBlank"`
	EvaluationMethod   *string `json:"metodo_evaluacion" validate:"omitempty,notBlank"`
	Organ              *string `json:"organo_afectado" validate:"omitempty,notBlank"`
	SubConcept         *string `json:"subconcepto_evaluar" validate:"omitempty,notBlank"`
	Unit               *string `json:"unimedida" validate:"omitempty,notBlank"`
}

const spConceptAgricola = "CONCEPTO_AGRICOLA"

func GetConceptAgricola(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	p := utils.GetQuery(r, "page", "")
	i := utils.GetQuery(r, "items", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	tc := utils.GetQuery(r, "concept", "")
	result, err := user.Sql.Page(
		fmt.Sprintf(`%v`, spConceptAgricola+"_L"),
		user.CompanyId,
		i,
		p,
		s,
		o,
		tc,
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

func GetConceptAgricolaDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body []concept
	id := utils.GetIntVar(r, "id")
	err := user.Sql.SelectProcedure(&body, spConceptAgricola+"_F", user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	if len(body) > 0 {
		b := body[0]
		b.MetaForm = utils.ToJson(b.MetaForm)
		b.SubConcept = utils.ToJson(b.SubConcept)
		return httpmessage.Send(b)
	}
	return httpmessage.Send(body)
}

func CreateUpdateConceptAgricola(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body concept
	id, err := utils.GetIntVarIds(r, "id")
	if err != nil {
		return httpmessage.Error(locale.ValidationError)
	}
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	///////////////////////////////
	var sc []subConcept
	d, _ := json.Marshal(body.SubConcept)
	_ = json.Unmarshal(d, &sc)
	//////////////////////////////////////
	for _, i := range sc {
		if valid, errors := validator.Validate(i); !valid {
			return httpmessage.Error(locale.ValidationError, errors)
		}
	}
	result, err := user.Sql.ExecJson(spConceptAgricola+constants.InsertUpdateSuffix,
		user.CompanyId,
		id,
		utils.JsonString(body),
		user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(result, raw)
}

//func UpdateConceptAgricola(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	id := utils.GetIntVar(r, "id")
//	var body concept
//	raw := utils.ParseBody(r, &body)
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//	_, err := user.Sql.ExecJson(spConceptAgricola+"_I", user.CompanyId, id, utils.JsonString(body), user.UserId)
//	if err != nil {
//		return httpmessage.Error(err)
//	}
//	return httpmessage.Log(raw)
//}

func DeleteConceptAgricola(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(spConceptAgricola+"_D", user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}
