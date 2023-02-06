package agritareo

import (
	"database/sql"
	"fmt"
	"go.mongodb.org/mongo-driver/bson/bsontype"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
)

type sowingBody struct {
	Id          int         `db:"id" json:"id,omitempty"`
	Code        string      `json:"codigo"`
	IdVariedad  int         `json:"idvariedad" validate:"required,empty,number"`
	Area        interface{} `json:"area"  validate:"required,empty"`
	FechaInicio interface{} `json:"fechainicio"`
	FechaFin    interface{} `json:"fechafin"`
	Map         Coordinates `json:"mapa"`
}

type Coordinates struct {
	Coordenadas []latLong `json:"coordenadas"`
}
type latLong struct {
	Latitud, Longitud float64
}

// --------------------
type sowingBody2 struct {
	Id          int           `db:"id" json:"id,omitempty"`
	Code        string        `json:"codigo"`
	IdVariedad  int           `json:"idvariedad" validate:"required,empty,number"`
	Area        interface{}   `json:"area"  validate:"required,empty"`
	FechaInicio int   `json:"fechainicio"`
	FechaFin    int   `json:"fechafin"`
	Map         []Coordinates `json:"mapa" validate:"required,empty"`
}

func GetSowing(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	result, err := user.Sql.ExecJson(constants.PGetSowing, user.CompanyId, id)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

//func EditSowing(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	var body sowingBody
//	raw := utils.ParseBody(r, &body)
//	body.Id = utils.GetIntVar(r, "cid")
//	body.IdVariedad = utils.GetIntVar(r, "sid")
//	if valid, errors := validator.Validate(body); !valid {
//		return httpmessage.Error(locale.ValidationError, errors)
//	}
//	_, err := user.Sql.ExecJson(constants.PUpdateSowing, user.CompanyId, body.Id, utils.JsonString(body))
//	if err != nil {
//		return httpmessage.Error(err)
//	}
//	return httpmessage.Log(raw)
//}

func DeleteSowing(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "sid")
	_, err := user.Sql.ExecJson(constants.PDeleteSowing, user.CompanyId, id)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

func CreateSowing(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body sowingBody
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	if valid, errors := validator.FormatDateFail(body.FechaInicio, body.FechaFin); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	var query string
	var geography interface{}
	var init string
	if body.Code == "" {
		result, err := user.Sql.Query(`SELECT TOP (1) codigo_siembra from tmsiembra ORDER BY codigo_siembra DESC`)
		if err != nil {
			return httpmessage.Error(err)
		}
		var number int
		for result.Next() {
			result.Scan(&number)
		}
		number = number + 1
		body.Code = fmt.Sprintf(`%v`, number)
	}


	if body.Map.Coordenadas != nil {
		for n, i := range body.Map.Coordenadas {

			if n == 0 {
				query = fmt.Sprintf(`%v %v`, i.Longitud, i.Latitud)
				init = query
			} else {
				query = fmt.Sprintf(`%v, %v %v`, query, i.Longitud, i.Latitud)
			}

		}

		geography = fmt.Sprintf(`'POLYGON((%v,%v))'`, query, init)
		logger.Debug(geography)
	} else {
		geography = bsontype.Null
	}
	_, err  := user.Sql.Query(fmt.Sprintf(`UPDATE TMSIEMBRA SET estado = 0 where idcentrocosto = %v`, id))
	if err != nil {
		return httpmessage.Error(err)
	}

	query = fmt.Sprintf(`
		insert into TMSIEMBRA  (
			idempresa,
			idvariedad,
			idcentrocosto,
			codigo_siembra,
			area,
			estado,
			coordenadas) VALUES (%v,%v,%v,'%v',%v,%v,%v)`,
		user.CompanyId,
		body.IdVariedad,
		id,
		body.Code,
		body.Area,
		1,
		geography,
	)
	_, err = user.Sql.Exec(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}
func UpdateSowing(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "sid")
	cc := utils.GetIntVar(r, "id")
	var body sowingBody2
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	if valid, errors := validator.FormatDateFail(body.FechaInicio, body.FechaFin); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	fmt.Println(id, cc, raw)
	var query string
	var init string

	for n, i := range body.Map[0].Coordenadas {
		fmt.Println(i)
		if n == 0 {
			query = fmt.Sprintf(`%v %v`, i.Longitud, i.Latitud)
			init = query
		} else {
			query = fmt.Sprintf(`%v, %v %v`, query, i.Longitud, i.Latitud)
		}

	}
	geography := fmt.Sprintf(`POLYGON((%v,%v))`, query, init)
	tx, err := user.Sql.Begin()
	if err != nil {
		return httpmessage.Error(err)
	}
	stm, err := tx.Prepare(`
		UPDATE TMSIEMBRA
		set coordenadas = ?,
			area = ?,
			fecha_inicio = ?,
			fecha_fin = ? WHERE id = ?  and idempresa = ?`)
	if err != nil {
		return httpmessage.Error(err)
	}
	defer stm.Close()
	_, err = stm.Exec(
		geography,
		body.Area,
		body.FechaInicio,
		body.FechaInicio,
		id,
		user.CompanyId)
	if err != nil {
		return httpmessage.Error(err)
	}
	if err = tx.Commit(); err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)

}

func StringNull(s string) sql.NullString {
	if len(s) == 0 {
		return sql.NullString{}
	}
	return sql.NullString{
		String: s,
		Valid: true,
	}
}

func GetSiembrasMap(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	idcentrocosto := utils.GetQuery(r, "idcentrocosto")
	idsiembra := utils.GetQuery(r, "idsiembra")
	result, err := user.Sql.ExecJson(constants.PListarSiembraM, idcentrocosto, idsiembra)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}


func GetSiembras(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	idcentrocosto := utils.GetQuery(r, "idcentrocosto")
	result, err := user.Sql.ExecJson(constants.PListarSiembraKENEDI, user.CompanyId, idcentrocosto)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}
