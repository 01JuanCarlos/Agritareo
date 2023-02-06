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

type EvaluationMethod struct {
	Id          int         `db:"id" json:"id,omitempty"`
	Code        *string     `db:"codigo" json:"codigo"`
	Name        *string     `db:"nombre" json:"nombre"`
	Status      bool        `db:"estado" json:"estado"`
	IdMeasure   *int        `db:"idmedida" json:"idmedida"`
	UMeasure    *string     `db:"unimedida" json:"unimedida"`
	IdInputType *int        `db:"idtipo_entrada" json:"idtipo_entrada"`
	InputType   string      `db:"tipo_entrada" json:"tipo_entrada"`
	Detail      *bool       `db:"permite_detalle" json:"permite_detalle"`
	InputNumber interface{} `db:"numero_entrada" json:"numero_entrada"`
	CVariety    interface{} `db:"cultivos_variedad" json:"cultivos_variedad"`
	Meta        interface{} `db:"meta_form" json:"meta_form"`
	//Description *string `db:"descripcion" json:"descripcion"`
	//EvaluationLevel interface{} `db:"niveles_evaluacion" json:"niveles_evaluacion"`
	//FirstDate       *string     `db:"fecha_creacion" json:"fecha_creacion"`
}

//////////////// for validate insert & update
type cultivoVariedad struct {
	//	Id                 *int          `json:"idcultivo,omitempty"`
	IdEvaluationMethod *int          `json:"idmetodo_evaluacion"`
	IdCropVariety      *int          `json:"idcultivo_variedad"`
	CropName           *string       `json:"cultivo"`
	VarietyName        *string       `json:"variedad"`
	Phenologies        []phenologies `json:"fenologias"`

	//Threshold          []thresholdPhenology `json:"umbrales_fenologia"`
}

type phenologies struct {
	Id                 interface{}          `json:"id,omitempty"`
	IdPhenologyVariety interface{}          `json:"idfenologia_variedad"`
	PhenologyVariety   *string              `json:"fenologia_variedad"`
	IdCropVariety      interface{}          `json:"idcultivo_variedad"`
	IdEvaluationMethod interface{}          `json:"idmetodo_evaluacion"`
	Threshold          []thresholdPhenology `json:"umbrales_rangos"`
}

type thresholdPhenology struct {
	Id                 *int    `json:"id,omitempty"`
	IdPhenologyVariety *int    `json:"idfenologia_variedad"`
	PhenologyVariety   *string `json:"fenologia_variedad"`
	IdMethod           *int    `json:"idmetodo_evaluacion_detalle"`
	NumberLevel        *int    `json:"numero_nivel"`
	NameLevel          *string `json:"nombre_nivel"`
	FirstRange         *string `json:"rango_inicio"`
	LastRange          *string `json:"rango_fin"`
}

///////////////////////////////////////////

const spEvaluationMethod = "METODO_EVALUACION_AGRICOLA"
const spEvaluationTypeEntry = "TIPO_ENTRADAS_EVALUACION"

func GetEvaluationMethod(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	i := utils.GetQuery(r, "items", "")
	p := utils.GetQuery(r, "page", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	t := utils.GetQuery(r, "concept-type", "")
	result, err := user.Sql.Page(spEvaluationMethod+"_L",
		user.CompanyId,
		i,
		p,
		s,
		o,
		t)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Page(
		result.Data,
		result.TotalFiltered,
		result.TotalRows,
	)
}

func CreateUpdateEvaluationMethod(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body EvaluationMethod
	var id interface{}
	id = utils.GetIntVar(r, "id")
	if id == 0 {
		id = nil
	}
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	var c []cultivoVariedad
	d, _ := json.Marshal(body.CVariety)
	_ = json.Unmarshal(d, &c)
	//// fix validate
	for _, i := range c {
		if valid, errors := validator.Validate(i); !valid {
			return httpmessage.Error(locale.ValidationError, errors)
		}
		//if id == nil {
		//	//c[v].Id = nil
		//	//for j, _ := range i.Threshold {
		//	//	c[v].Threshold[j].Id = nil
		//	//}
		//}
		if i.Phenologies != nil {
			for _, j := range i.Phenologies {
				if len(j.Threshold) != 3 {
					return httpmessage.Error(fmt.Sprintf(`rango de umbrales incorrecto:  %v`, *j.PhenologyVariety))
				}
			}
		}
	}
	/////////////////////////////
	body.CVariety = c
	result, err := user.Sql.ExecJson(spEvaluationMethod+constants.InsertUpdateSuffix,
		user.CompanyId,
		id,
		utils.JsonString(body),
		user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(result, raw)
}


func GetEvaluationMethodDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body []EvaluationMethod
	err := user.Sql.SelectProcedure(&body, spEvaluationMethod+constants.DetailSuffix, user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	if len(body) > 0 {
		var iBody = body[0]
		fmt.Println(iBody.CVariety)
		iBody.CVariety = utils.ToJson(iBody.CVariety)
		//iBody.EvaluationLevel = utils.ToJson(iBody.EvaluationLevel)
		iBody.Meta = utils.ToJson(iBody.Meta)
		return httpmessage.Send(iBody)
	}
	return httpmessage.Send(body)
}

func DeleteEvaluationMethod(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(spEvaluationMethod+"_D", user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

func GetEvaluationTypeEntry(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	result, err := user.Sql.ExecJson(spEvaluationTypeEntry + "_F")
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

