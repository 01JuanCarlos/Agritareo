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

type varietyBody struct {
	Id            int    `db:"id" json:"id,omitempty"`
	Nombre        string `db:"nombre" json:"nombre"`
	IdCultivo     int    `db:"idcultivo" json:"idcultivo,omitempty" validate:"required,notBlank,number"`
	Codigo        string `db:"codigo" json:"codigo"`
	CodigoCultivo string `db:"codigocultivo" json:"codigocultivo"`
	Estado        bool   `db:"estado" json:"estado"` // fail validation bool

}

type conceptoVarietyBody struct {
	Id          int    `db:"id" json:"id,omitempty"`
	IdPlaga     interface{}    `db:"idplaga" json:"idplaga,omitempty"`
	Nombre      string `db:"nombre" json:"nombre"`
	IdVariedad  int    `db:"idvariedad" json:"idvariedad,omitempty" validate:"required,notBlank,number"`
	Codigo      string `db:"codigo" json:"codigo"`
	NombrePlaga string `db:"nombre_plaga" json:"nombre_plaga,omitempty"`
}

type cropsVariety struct {
	ID     interface{} `json:"id" validate:"required,empty,number"`
	Nombre string      `json:"nombre" validate:"required,empty"`
	Codigo string      `json:"codigo"`
	//Estado bool        `db:"estado" json:"estado"` // fail validation bool
}

type phenologyBody struct {
	Id              int         `db:"id" json:"id,omitempty"`
	IdCultivo       int         `db:"idcultivo" json:"idcultivo,omitempty" validate:"required,notBlank,number"`
	NombreFenologia string      `db:"nombre" json:"nombre" validate:"required,notBlank"`
	Codigo          string      `db:"codigo" json:"codigo"`
	Dias            interface{} `db:"dias" json:"dias,omitempty" validate:"required,notBlank,number"`
	Estado          bool        `db:"estado" json:"estado"`
}

func GetCropsVariety(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var variety []varietyBody
	err := user.Sql.SelectProcedure(&variety, constants.PListarVariedades, id)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(variety)
}

func CreateVariety(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body cropsVariety
	raw := utils.ParseBody(r, &body)
	body.ID = utils.GetIntVar(r, "id")
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	tx,err :=user.Sql.Begin()
	if err != nil {
		return httpmessage.Error(err)
	}
	defer tx.Rollback()
		if body.Codigo == "" {
			rows, err :=  tx.Query(`SELECT COUNT (*) FROM TMCULTIVO_VARIEDAD`)
			if err != nil {
				return httpmessage.Error(err)
			}
			var numberCont int // revisar y corrgir urrelo
			for rows.Next() {
				if err := rows.Scan(&numberCont); err != nil {
					return httpmessage.Error(err)
				}
			}

			body.Codigo = fmt.Sprintf("%04d", numberCont+1) // tmb hacer genrico
		}
		fmt.Println(body.Codigo)

	 rows, err := tx.Query(fmt.Sprintf(`
						DECLARE @table table (id int);
						INSERT INTO TMCULTIVO_VARIEDAD(idcultivo,nombre,codigo)
						output inserted.id into @table (id)  
						VALUES (%v,'%v','%v');
						SELECT id from @table;
		`,body.ID, body.Nombre, body.Codigo))
	if err != nil {
		return httpmessage.Error(err)
	}
	var insertId int
	for rows.Next() {
		if err := rows.Scan(&insertId); err != nil {
			return httpmessage.Error(err)
		}
	}
	// asignamos todas las fenologias existentes
	var fen []int
	err = user.Sql.Select(&fen, fmt.Sprintf(`SELECT id from TMFENOLOGIA WHERE idcultivo = %v`, body.ID))
	if err != nil {
		return httpmessage.Error(err)
	}
	if len(fen) > 0 {

//-------------- FIXME: HACER FUNCION
		var count int
		rows, err := user.Sql.Query(fmt.Sprintf(`
		SELECT TOP 1 orden FROM  TMFENOLOGIA_VARIEDAD_CULTIVO
		WHERE idvariedad = '%v' AND idcultivo = '%v'  ORDER BY orden DESC`,
			insertId,
			body.ID))
		// -----------------------------
		if err != nil {
			return httpmessage.Error(err)
		}
		for rows.Next() {
			if err := rows.Scan(&count); err != nil {
				return httpmessage.Error(err)
			}
		}
		count = count + 1
		for _,i := range fen {
			fmt.Println(i)
			_, err = tx.Query(fmt.Sprintf(`
		INSERT INTO TMFENOLOGIA_VARIEDAD_CULTIVO(idfenologia, 
		idvariedad, 
		idcultivo,
		estado,
		orden) values(%v,%v,%v,1,%v)`, i, insertId,body.ID, count))
		}
	}

	_, err = tx.Query(fmt.Sprintf(`
		WITH temp_PC(idplaga, idcultivo, estado, idvariedad) as
		(select id as idplaga,
		idcultivo,
		1, 
		(%v) as idvariedad FROM TMPLAGA WHERE idcultivo = %v )
	INSERT INTO TMPLAGA_CULTIVO(idplaga, 
	idcultivo, 
	estado,
	idvariedad
	) select idplaga, idcultivo,estado,idvariedad from temp_PC`, insertId, body.ID))
	if err != nil {
		return httpmessage.Error(err)
	}
	if err := tx.Commit(); err != nil {
		return  httpmessage.Error(err)
	}

	return httpmessage.Log(raw)
}

func UpdateVariety(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body varietyBody
	raw := utils.ParseBody(r, &body)
	body.Id = utils.GetIntVar(r, "vid")
	body.IdCultivo = utils.GetIntVar(r, "id")
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.PUpdateVariety, user.CompanyId, body.Id, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func DeleteVariety(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "vid")
	_, err := user.Sql.ExecJson(constants.PDeleteVariety, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty() // FIXED
}

func StatusVariety(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "vid")
	_, err := user.Sql.ExecJson(constants.UpdateStatusVariety, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	//FIXME: SEND LOG
	return httpmessage.Empty()
}

func GetAssignedPhenology(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "vid")
	cid := utils.GetIntVar(r, "cid")
	var body []phenologyBody
	err := user.Sql.Select(&body,
		fmt.Sprintf(`
		SELECT id, idcultivo,nombre,codigo,dias,estado 
		FROM TMFENOLOGIA
		WHERE idvariedad = %v AND idempresa = %v AND idcultivo = %v`, id, user.CompanyId, cid))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(body) // FIXED
}

func GetConceptoVariety(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var variety []conceptoVarietyBody
	err := user.Sql.SelectProcedure(&variety, constants.PListarConceptosVariedades, user.CompanyId, id)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(variety)
}

//func GetConceptoVariety(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	id := utils.GetIntVar(r, "id")
//	var variety []conceptoVarietyBody
//	err := user.Sql.SelectProcedure(&variety, constants.PListarConceptosVariedades, id)
////		return httpmessage.Error(err)
//}
//return httpmessage.Send(variety)
//}
