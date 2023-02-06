package agritareo

import (
	"fmt"
	"log"
	"math"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/core/server"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
	"strconv"
	"time"
)

type evaluacionBody struct {
	IdSiembra     int         `db:"idsiembra" json:"idsiembra,omitempty" validate:"required,notBlank"`
	ValorNumerico int         `db:"valornumerico" json:"valornumerico,omitempty" validate:"required,notBlank"`
	ValorTexto    string      `db:"valortexto" json:"valortexto,omitempty"`
	IdConcepto    int         `db:"idconcepto" json:"idconcepto,omitempty" validate:"required,notBlank"`
	IdPlaga       int         `db:"idplaga" json:"idplaga,omitempty" validate:"required,notBlank"`
	IdCampania    int         `json:"idcampania" validate:"required,empty" validate:"required,notBlank"`
	Fecha         interface{} `db:"fecha" json:"fecha,omitempty" validate:"required,notBlank"`
	Latitud       string      `db:"latitud" json:"latitud,omitempty" validate:"required,notBlank"`
	Longitud      string      `db:"longitud" json:"longitud,omitempty" validate:"required,notBlank"`
	Nota          string      `db:"nota" json:"nota,omitempty"`
}

type evaluacion struct {
	Id                 int         `db:"id" json:"id,omitempty" validate:"required,notBlank"`
	IdSiembra          int         `db:"idsiembra" json:"idsiembra,omitempty" validate:"required,notBlank"`
	IdUsuario          int         `db:"idusuario" json:"idusuario,omitempty" validate:"required,notBlank"`
	ValorNumerico      int         `db:"valornumerico" json:"valornumerico,omitempty" validate:"required,notBlank"`
	ValorTexto         string      `db:"valortexto" json:"valortexto,omitempty"`
	IdConcepto         int         `db:"idconcepto" json:"idconcepto,omitempty" validate:"required,notBlank"`
	IdPlaga            int         `db:"idplaga" json:"idplaga,omitempty" validate:"required,notBlank"`
	IdCampania         int         `json:"idcampania" validate:"required,empty" validate:"required,notBlank"`
	Fecha              interface{} `db:"fecha" json:"fecha,omitempty" validate:"required,notBlank"`
	Latitud            string      `db:"latitud" json:"latitud,omitempty" validate:"required,notBlank"`
	Longitud           string      `db:"longitud" json:"longitud,omitempty" validate:"required,notBlank"`
	Nota               string      `db:"nota" json:"nota,omitempty"`
	NombreUsuario      string      `db:"nombre" json:"nombre,omitempty" validate:"required,notBlank"`
	Usuario            string      `db:"usuario" json:"usuario,omitempty" validate:"required,notBlank"`
	IdEstadoFenologico int         `db:"idestadofenologico" json:"idestadofenologico,omitempty" validate:"required,notBlank"`
	NombrePlaga        string      `db:"nombreplaga" json:"nombreplaga,omitempty" validate:"required,notBlank"`
}

type evaluacionDetBody struct {
	IdEtiqueta    int    `db:"idetiqueta" json:"idetiqueta"`
	IdSubEtiqueta int    `db:"idsubetiqueta" json:"idsubetiqueta"`
	IdPlaga       int    `db:"idplaga" json:"idplaga"`
	ValorNumerico int    `db:"valornumerico" json:"valornumerico"`
	ValorTexto    string `db:"valortexto" json:"valortexto"`
}


type ConceptB struct {
	Id      int    `db:"id" json:"id,omitempty"`
	Nombre  string `db:"nombre" json:"nombre"`
	IdPlaga int    `db:"idplaga" json:"idplaga,omitempty" validate:"required,notBlank,number"`
	Codigo  string `db:"codigo" json:"codigo"`
	Medida  string `db:"medida" json:"medida"`
	Estado  bool   `db:"estado" json:"estado"` // fail validation bool

}

type evaluationImages struct {
	Id   int
	Ruta string
}

func GetEvaluationsLote(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body []evaluacion
	query := fmt.Sprintf(`select E.idsiembra, E.valornumerico, E.idplaga, P.nombre as 'nombreplaga', E.idcampania, E.id, E.fecha, E.idconcepto, E.nota, E.idestadofenologico from TMEVALUACION E
	inner join TMPLAGA_CULTIVO PC on PC.idplaga = E.idplaga
	inner join TMPLAGA	P on P.id = PC.idplaga
	WHERE idsiembra= %v`, id)
	println(query)
	err := user.Sql.Select(&body, query)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(body)
}

func GetEvaluations(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body []evaluacion
	err := user.Sql.Select(&body, `select E.idsiembra,E.valornumerico,E.valortexto,E.idplaga,E.idcampania, E.id,
	E.fecha,E.idusuario,E.idconcepto,E.nota, U.id as 'idusuario', U.usuario, U.nombre from tmevaluacion E
	inner join TMUSUARIO U on U.id = E.idusuario`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(body)
}


func GetEvaluationDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	result, err := user.Sql.ExecJson("EVALUACION_F", user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func DeleteEvaluation(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.Query(constants.Exist(constants.TEvaluation, id))
	if err != nil {
		return httpmessage.Error(err)
	}
	var childrens []evaluationImages
	err = user.Sql.Select(&childrens,
		fmt.Sprintf(`SELECT id, ruta FROM TMIMAGEN WHERE idevaluacion = %v and idempresa = %v`, id, user.CompanyId))
	if err != nil {
		return httpmessage.Error(err)
	}
	if len(childrens) > 0 {
		return httpmessage.Send(struct {
			Info string             `json:"info"`
			Data []evaluationImages `json:"data"`
		}{
			"El registro cuenta con la siguiente data asociada",
			childrens,
		})
	}
	_, err = user.Sql.Query(constants.Delete(constants.TEvaluation, id))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

//func GetConceptos(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	id := utils.GetIntVar(r, "pid")
//	var concept []ConceptB
//	err := user.Sql.SelectProcedure(&concept, constants.PListConceptos, id)
//	if nil != err {
//		return httpmessage.Error(err)
//	}
//	return httpmessage.Send(concept)
//}
//
//func CreateConcept(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	var body conceptsBody
//	raw := utils.ParseBody(r, &body)
//	body.PlagueId = utils.GetIntVar(r, "pid")
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//	_, err := user.Sql.ExecJson(constants.PInsertConcept, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		return httpmessage.Error(err)
//	}
//	return httpmessage.Log(raw)
//}
//
//func UpdateConcept(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	var body conceptsBody
//	id := utils.GetIntVar(r, "id")
//	raw := utils.ParseBody(r, &body)
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//	_, err := user.Sql.ExecJson(constants.PUpdateConcept, user.CompanyId, id, utils.JsonString(body))
//	if err != nil {
//		return httpmessage.Error(err)
//	}
//	return httpmessage.Log(raw)
//}
//
//func DeleteConcept(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	id := utils.GetIntVar(r, "id")
//	_, err := user.Sql.ExecJson(constants.PDeleteConcept, user.CompanyId, id)
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(err)
//	}
//	return httpmessage.Empty()
//}
//
//func StatusConcept(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	id := utils.GetIntVar(r, "cid")
//	_, err := user.Sql.ExecJson(constants.PUpdateStatusConcept, user.CompanyId, id)
//	if err != nil {
//		return httpmessage.Error(err)
//	}
//	//FIXME: SEND LOG
//	return httpmessage.Empty()
//}

type phenology struct {
	Id     int
	Nombre string
	Dias   int
	Orden  int
}

func PostEvaluacion(user *sts.Client, r *http.Request) httpmessage.HttpMessage {

	var body evaluacionBody
	raw := utils.ParseBody(r, &body)

	idVar := utils.GetIntVar(r, "vid")
	body.IdConcepto = utils.GetIntVar(r, "id")
	//fmt.Println("registrao")
	//ctx, cancel := context.WithCancel(ctx)
	//defer cancel()
	fmt.Println(raw, idVar)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	if valid, errors := validator.FormatDateFail(body.Fecha); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	lat, _ := strconv.ParseFloat(body.Latitud, 64)
	long, _ := strconv.ParseFloat(body.Longitud, 64)

	if lat == 0 || long == 0 {
		return httpmessage.Error("Coordenadas incorrectas")
	}
	point := fmt.Sprintf(`POINT(%v %v)`, long, lat)
	tx, err := user.Sql.Begin()
	if err != nil {
		return httpmessage.Error(err)
	}
	defer tx.Rollback()
	var firstDate, lastDate string
	rows, err := tx.Query(fmt.Sprintf(`
	SELECT fechainicio,fechafin from TMCAMPANIA WHERE ID = %v`, body.IdCampania))
	if err != nil {
		return httpmessage.Error(err)
	}
	for rows.Next() {
		if err := rows.Scan(&firstDate, &lastDate); err != nil {
			return httpmessage.Error(err)
		}
	}
	ok, numberDay := inRange(firstDate, lastDate, body.Fecha.(string))
	if !ok {
		return httpmessage.Error("La fecha ingresada no se encuentra en el rango de la campaña especificada.")
	}

	query := fmt.Sprintf(`
		SELECT id from TMEVALUACION 
		where idsiembra = %v AND idplaga = %v
		AND idcampania =  %v AND idconcepto = %v
		AND CONVERT(DATE, fecha) = '%v'`,
		body.IdSiembra,
		body.IdPlaga,
		body.IdCampania,
		body.IdConcepto,
		body.Fecha)
	fmt.Println("data enviada:", query)

	var exist []int
	err = user.Sql.Select(&exist, query)
	if err != nil {
		return httpmessage.Error(err)
	}
	fmt.Println(exist)
	if len(exist) != 0 {
		fmt.Println("go update..", exist[0])
		stm, err := tx.Prepare(`UPDATE TMEVALUACION SET valornumerico = ?,
			valortexto = ?,
		 	nota = ?,
			idusuario = ?,
			coordenadas = ?
			WHERE id = ?`)
		if err != nil {
			return httpmessage.Error(err)
		}
		defer stm.Close()
		_, err = stm.Exec(
			body.ValorNumerico,
			body.ValorTexto,
			body.Nota,
			user.UserId,
			point,
			exist[0])
		if err != nil {
			return httpmessage.Error(err)
		}
		if err = tx.Commit(); err != nil {
			return httpmessage.Error(err)
		}
		return httpmessage.Send(exist[0], raw)
	}
	fmt.Println("Nuevo registro")
	var bodyPhenology []phenology
	query = fmt.Sprintf(`
	select fvc.idfenologia as id, f.nombre, f.dias, fvc.orden from TMFENOLOGIA_VARIEDAD_CULTIVO fvc
	inner join TMFENOLOGIA f on f.id = fvc.idfenologia
	inner join TMPLAGA P on p.idcultivo =  fvc.idcultivo
	WHERE p.id = %v and fvc.idvariedad = %v ORDER BY fvc.orden ASC
	`, body.IdPlaga, idVar)
	err = user.Sql.Select(&bodyPhenology, query)
	if err != nil {
		return httpmessage.Error(err)
	}
	if bodyPhenology == nil {
		return httpmessage.Error("El cultivo no cuenta con fenologias")
	}
	var id int // phenology ID
	var sumDays int64

	for _, j := range bodyPhenology {
		fmt.Println(j)
		sumDays = sumDays + int64(j.Dias)
		fmt.Println(sumDays)
		if numberDay <= sumDays {
			id = j.Id
			break
		}
	}
	// if  id fenologia es  0
	if id == 0 {
		return httpmessage.Error("te encuentras fuera del rango de las fenologias")
	}
	query = fmt.Sprintf(`
	select id, rango_1, rango_2, rango_3 from TMESTADO_FENOLOGICO 
	where idfenologia = %v and idconcepto = %v and  idvariedad = %v`, id, body.IdConcepto, idVar)
	fmt.Println(query)
	rows, err = user.Sql.Query(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	var idef int
	var rango1, rango2, rango3 interface{}
	for rows.Next() {
		if err := rows.Scan(&idef, &rango1, &rango2, &rango3); err != nil {
			return httpmessage.Error(err)
		}
	}
	logger.Debug("id and ranges: ", idef, rango1, rango2, rango3)
	if idef == 0 {
		return httpmessage.Error("concepto sin estados fenologicos")
	}
	if rango1 == nil || rango2 == nil || rango3 == nil {
		return httpmessage.Error("estado fenologico no cuentas con rangos")
	}
	stm, err := tx.Prepare(`INSERT INTO TMEVALUACION(idsiembra,
	idusuario,
	valornumerico,
	valortexto,
	idconcepto,
	idplaga,
	idcampania,
	fecha,
	nota,
	idestadofenologico,
	coordenadas) VALUES(?,?,?,?,?,?,?,?,?,?,?)`)
	if err != nil {
		return httpmessage.Error(err)
	}
	defer stm.Close()

	_, err = stm.Exec(body.IdSiembra,
		user.UserId,
		body.ValorNumerico,
		body.ValorTexto,
		body.IdConcepto,
		body.IdPlaga,
		body.IdCampania,
		body.Fecha,
		body.Nota,
		idef,
		point)

	if err != nil {
		return httpmessage.Error(err)
	}
	if err = tx.Commit(); err != nil {
		return httpmessage.Error(err)
	}

	return httpmessage.Log(raw)

}

// -------fixme: mover  funcion

func inRange(firstDate, lastDate, fecha string) (bool, int64) {
	start, _ := time.Parse(time.RFC3339, firstDate)
	end, _ := time.Parse(time.RFC3339, lastDate)
	now, _ := time.Parse(time.RFC3339, fecha)
	if now.After(start) && now.Before(end) {
		fmt.Println(start, end, now)
		duration := now.Sub(start)
		days := int64(math.Floor(duration.Hours() / 24))
		return true, days
	}
	return false, 0
}

//---------------------

func PostEvaluacionDet(user *sts.Client, r *http.Request) *sts.HttpResponse {
	var body evaluacionDetBody
	raw := utils.ParseBody(r, &body)
	//fmt.Println("fail", body)

	if valid, errors := validator.Validate(body); !valid {
		return server.ErrorMessage(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PInsertEvaluacionDet, body.IdEtiqueta, body.IdSubEtiqueta, body.IdPlaga, body.ValorNumerico, body.ValorTexto)
	if err != nil {
		log.Println(err)
		return server.ErrorMessage(err)
	}
	//log.Println("Sucursal Registrada")
	return server.EmptyMessage(raw)
}

//---------------------------- refactorizado

func GetFistEvaluation(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	result, err := user.Sql.ExecJson(constants.PGetFirstEvaluation, user.CompanyId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

type farmBody struct {
	Nombrenivel string `db:"nombrenivel" json:"nombre"`
	Id          int    `db:"id" json:"id"`
	Codigo      string `db:"codigo" json:"codigo"`
	Order       int    `db:"order" json:"order"`
	Latitud     string `db:"latitud" json:"latitud"`
	Longitud    string `db:"longitud" json:"longitud"`
}

func GetFarm(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body []farmBody
	err := user.Sql.Select(&body, `SELECT 
	ROW_NUMBER() OVER(ORDER BY nombrenivel DESC) AS 'order',
	nombrenivel, id, codigo, latitud,longitud
	FROM TMCENTROCOSTO where idnivelconfiguracion = 11`)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(body)
}

// fixme: urrelo muevelo
type evaluationBody struct {
	Nota string `json:"nota"`
}

func CreateNote(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "eid")
	var body evaluationBody
	raw := utils.ParseBody(r, &body)
	_, err := user.Sql.ExecJson(constants.PUpdateNote, user.CompanyId, id, body.Nota)
	if err != nil {
		return httpmessage.Error(err)
	}
	//URRELO  ENVIALO AL LOG
	return httpmessage.Log(raw)
}
