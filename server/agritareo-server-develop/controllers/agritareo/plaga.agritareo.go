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

type plagaBody struct {
	ID               interface{} `json:"id" validate:"required,empty,number"`
	Nombre           string      `db:"nombre" json:"nombre"`
	NombreCientifico string      `db:"nombrecientifico" json:"nombrecientifico"`
	//IdVariedad       int         `db:"idvariedad" json:"idvariedad"`
	IdCultivo int         `db:"idcultivo" json:"idcultivo"`
	Alias     string      `db:"alias" json:"alias"`
	Codigo    string      `db:"codigo" json:"codigo"`
	Estado    interface{} `db:"estado" json:"estado"`
	Tipo      string      `json:"tipo,omitempty"`
}

type plagueBody struct {
	Id               int         `db:"id" json:"id,omitempty"`
	Nombre           string      `db:"nombre" json:"nombre"`
	NombreCientifico string      `db:"nombrecientifico" json:"nombrecientifico"`
	IdVariedad       int         `db:"idvariedad" json:"idvariedad"`
	IdCultivo        int         `db:"idcultivo" json:"idcultivo"`
	Alias            string      `db:"alias" json:"alias"`
	Codigo           string      `db:"codigo" json:"codigo"`
	Estado           interface{} `db:"estado" json:"estado"`
	Tipo             string      `json:"tipo,omitempty"`
}

type plagaBodyL struct {
	Id               int         `db:"id" json:"id"`
	Nombre           string      `db:"nombre" json:"nombre"`
	NombreCientifico interface{}      `db:"nombrecientifico" json:"nombrecientifico"`
	Alias            interface{}      `db:"alias" json:"alias,omitempty"`
	Codigo           string      `db:"codigo" json:"codigo,omitempty"`
	Tipo             interface{} `json:"tipo,omitempty"`
	Estado           bool        `db:"estado" json:"estado" validate:"required,empty"`
}

type UmbralBody struct {
	Id          int    `db:"id" json:"id"`
	IdConcepto  int    `db:"idconcepto" json:"idconcepto"`
	Rango_1     string `db:"rango_1" json:"rango_1"`
	Rango_2     string `db:"rango_2" json:"rango_2"`
	Rango_3     string `db:"rango_3" json:"rango_3"`
	Descripcion string `db:"descripcion" json:"descripcion,omitempty"`
	Codigo      string `db:"codigo" json:"codigo,omitempty"`
}

type PlagueGo struct {
	Id               int         `db:"id" json:"id,omitempty"`
	IdPlaga          int         `db:"idplaga" json:"idplaga,omitempty"`
	IdCultivo        int         `db:"idcultivo" json:"idcultivo,omitempty"`
	IdVariedad       int         `db:"idvariedad" json:"idvariedad,omitempty"`
	Nombre           string      `db:"nombre" json:"nombre"`
	NombreCientifico interface{}      `db:"nombrecientifico" json:"nombrecientifico"`
	Estado           interface{} `db:"estado" json:"estado"`
}

type etiquetaBody struct {
	Id      int    `db:"idetiqueta" json:"idetiqueta,omitempty"`
	Nombre  string `db:"nombre" json:"nombre"`
	IdPlaga int    `db:"idplaga" json:"idplaga,omitempty"`
}

type etiquetasBody struct {
	IDPlaga    interface{} `db:"idplaga" json:"idplaga"`
	IDEtiqueta interface{} `db:"idetiqueta" json:"idetiqueta"`
	Nombre     string      `db:"nombre" json:"nombre"`
	Codigo     string      `db:"codigo" json:"codigo"`
}

type cultivoVariedadBody struct {
	IdPlaga    int `db:"idplaga" json:"idplaga" validate:"required,empty"`
	Idcultivo  int `db:"idcultivo" json:"idcultivo" validate:"required,empty"`
	IdVariedad int `db:"idvariedad" json:"idvariedad"`
}

type subetiquetaBody struct {
	IdEtiqueta   int    `db:"idetiqueta" json:"idetiqueta,omitempty"`
	Nombre       string `db:"nombre" json:"nombre"`
	TipoDato     string `db:"tipodato" json:"tipodato"`
	Nivel1       string `db:"nivel1" json:"nivel1"`
	Nivel2       string `db:"nivel2" json:"nivel2"`
	Nivel3       string `db:"nivel3" json:"nivel3"`
	Obligatorio  bool   `db:"obligatorio" json:"obligatorio"`
	UnidadMedida string `db:"unidaddemedida" json:"unidaddemedida"`
}

//type PhenologyConceptBody struct {
//	Id     interface{} `json:"id" validate:"required,empty,number"`
//	Nombre string      `db:"nombre" json:"nombre"`
//	Codigo string      `db:"codigo" json:"codigo"`
//	IdFenologia interface{} `db:"idfenologia " json:"idfenologia,omitempty"`
//	IdVariedad  interface{} `db:"idvariedad" json:"idvariedad,omitempty"`
//	IdConcepto  interface{} `db:"idconcepto" json:"idconcepto,omitempty"`
//}

func CreatePlagues(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body plagaBody
	raw := utils.ParseBody(r, &body)
	body.ID = utils.GetIntVar(r, "id")
	if body.Estado == nil {
		body.Estado = true
	}
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PInsertPlaga,
		user.CompanyId,
		body.ID,
		body.Codigo,
		body.Nombre,
		body.Alias,
		body.NombreCientifico,
		body.Estado,
		body.Tipo)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func UpdatePlague(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body plagueBody
	raw := utils.ParseBody(r, &body)
	body.Id = utils.GetIntVar(r, "pid")
	body.IdCultivo = utils.GetIntVar(r, "id")
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PUpdatePlaga, user.CompanyId, body.Id, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

type validateIDS struct {
	Ic interface{} `json:"ic" validate:"required,empty,number"` //ID CROPS(CULTIVO)
	Ip interface{} `json:"ip" validate:"required,empty,number"` // ID PLAGUE
}

// ENDPOINT WITH VALIDATE QUERY TEST
func GetPlagueDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var keys validateIDS
	keys.Ic = utils.GetQuery(r, "ic", "")
	keys.Ip = utils.GetQuery(r, "ip", "")

	if valid, errors := validator.Validate(keys); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	result, err := user.Sql.ExecJson(constants.PGetPlagueDetail, user.CompanyId, utils.JsonString(keys))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

// ----------------------------------------------------

/*func GetPlagueByVariedad(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "vid")
	var plaga []PlagueGo
	err := user.Sql.Select(&plaga, fmt.Sprintf(`select PC.id, PC.idplaga, PC.idcultivo, PC.idvariedad, P.nombre, P.nombrecientifico, PC.estado from TMPLAGA_CULTIVO PC
	inner join TMPLAGA P on P.id = PC.idplaga where idvariedad = %v`, id))
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(plaga)
} */

func GetPlagueByVariedad(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "vid")
	var plague []PlagueGo
	err := user.Sql.SelectProcedure(&plague, constants.PGetPlagueCrops, user.CompanyId, id)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(plague)
}

func PostEtiqueta(user *sts.Client, r *http.Request) *sts.HttpResponse {
	var body etiquetaBody
	raw := utils.ParseBody(r, &body)
	//fmt.Println("fail", body)

	if valid, errors := validator.Validate(body); !valid {
		return server.ErrorMessage(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PInsertEtiqueta, body.Nombre, body.IdPlaga)
	if err != nil {
		log.Println(err)
		return server.ErrorMessage(err)
	}
	//log.Println("Sucursal Registrada")
	return server.EmptyMessage(raw)
}

func PostSubetiqueta(user *sts.Client, r *http.Request) *sts.HttpResponse {
	var body subetiquetaBody
	raw := utils.ParseBody(r, &body)
	//fmt.Println("fail", body)

	if valid, errors := validator.Validate(body); !valid {
		return server.ErrorMessage(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PInsertSubetiqueta, body.IdEtiqueta, body.Nombre, body.TipoDato, body.UnidadMedida, body.Obligatorio)
	if err != nil {
		log.Println(err)
		return server.ErrorMessage(err)
	}
	//log.Println("Sucursal Registrada")
	return server.EmptyMessage(raw)
}

func GetEtiquetasUmbrales(user *sts.Client, r *http.Request) *sts.HttpResponse {
	idPlaga := utils.GetQuery(r, "idPlaga")
	idSiembra := utils.GetQuery(r, "idSiembra")
	result,
	err := user.Sql.ExecJson(constants.PListEtiquetaUmbrales, idPlaga, idSiembra)
	if nil != err {
		return server.ErrorMessage(err)
	}
	return server.RawMessage(result)
}

//func GetPlagaCultivoVariedad(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	idCultivo := utils.GetQuery(r, "idCultivo")
//	var body []plagaBodyL
//	err := user.Sql.SelectProcedure(&body, constants.PListPlagaCultivoVariedad, idCultivo)
//	if nil != err {
//		return httpmessage.Error(err)
//	}
//	return httpmessage.Send(body)
//}

func GetEtiqueta(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	idPlaga := utils.GetQuery(r, "idPlaga")
	//var etiquetas []etiquetasBody
	//err := user.Sql.SelectProcedure(&etiquetas, constants.PListEtiqueta, idPlaga)
	etiquetas, err := user.Sql.ExecJson(constants.PListEtiqueta, idPlaga)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(etiquetas)
}

func StatusPlagueCrops(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "pid")
	_, err := user.Sql.ExecJson(constants.UpdateStatusPlagueCrops, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	//FIXME: SEND LOG
	return httpmessage.Empty()
}

func GetSubtiqueta(user *sts.Client, r *http.Request) *sts.HttpResponse {
	idSiembra := utils.GetQuery(r, "idSiembra")
	result, err := user.Sql.ExecJson(constants.PListSubetiqueta, idSiembra)
	if nil != err {
		return server.ErrorMessage(err)
	}
	return server.RawMessage(result)
}

func GetCropsPlague(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var plague []plagaBodyL
	err := user.Sql.SelectProcedure(&plague, constants.PListPlagaCultivoVariedad, id)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(plague)
}

func GetEtiquetasBySiembra(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	result, err := user.Sql.ExecJson(constants.PGetEtiquetasBySiembras, id)
	if err != nil {
		return httpmessage.Error(locale.SomethingBadHappened)
	}
	return httpmessage.Json(result)
}

// UMBRALES

func GetPhenologyConcept(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "cid")
	vid := utils.GetIntVar(r, "vid")
	result, err := user.Sql.ExecJson(constants.PListarConceptosByFenologias, user.CompanyId, id, vid)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func UpdatePhenologyConcept(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body UmbralBody
	raw := utils.ParseBody(r, &body)
	body.Id = utils.GetIntVar(r, "id")
	body.IdConcepto = utils.GetIntVar(r, "cid")
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PUpdateConceptosByFenologias, user.CompanyId, body.Id, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}
