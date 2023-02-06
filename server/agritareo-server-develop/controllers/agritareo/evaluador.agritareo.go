package agritareo

import (
	"encoding/json"
	"log"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
)

type evaluatorBody struct {
	Id                 *int        `db:"id" json:"id,omitempty"`
	Name               *string     `db:"nombre" json:"nombre" validate:"required,notBlank"`
	ApellidoPaterno    *string     `db:"apellido_paterno" json:"apellido_paterno"`
	ApellidoMaterno    *string     `db:"apellido_materno" json:"apellido_materno"`
	RegistraEvaluacion bool        `db:"registra_evaluaciones" json:"registra_evaluaciones"`
	Phone              interface{} `db:"telefonos" json:"telefonos"`
	IdUser             *int        `db:"idusuario" json:"idusuario,omitempty"`
	Color              *string     `db:"color" json:"color"`
	User               *string     `db:"usuario" json:"usuario" validate:"required,notBlank"`
	Photo              *string     `db:"foto" json:"foto,omitempty"`
	IdUserCreator      *int        `db:"idusuario_creador" json:"idusuario_creador,omitempty"`
	UserCreator        *string     `db:"usuario_creador" json:"usuario_creador,omitempty"`
	Enabled            *bool       `db:"habilitado" json:"habilitado"`
	Profile            interface{} `db:"datos_perfil" json:"datos_perfil" validate:"required,notBlank"`
	Data               interface{} `db:"datos_evaluador" json:"datos_evaluador"`
	Emails             interface{} `db:"correos" json:"correos"`
	Meta               interface{} `db:"meta_form" json:"meta_form,omitempty"`
}

type responsableBody struct {
	Id            *int    `db:"id" json:"id,omitempty"`
	Codigo        interface{} `db:"codigo" json:"codigo" validate:"required,notBlank"`
	Nombre        *string `db:"nombre" json:"nombre"`
	FechaCreacion interface{} `db:"fecha_creacion" json:"fecha_creacion"`
}

//type userBody struct {
//	Id            int         `db:"id" json:"id"`
//	Nombre        string      `db:"nombre" json:"nombre"`
//	Usuario       string      `db:"usuario" json:"usuario"`
//	Habilitado    interface{} `db:"habilitado" json:"habilitado"`
//	FechaCreacion interface{} `db:"fecha_creacion" json:"fecha_creacion"`
//	IdPerfil      int         `db:"idperfil" json:"idperfil"`
//	NombrePerfil  string      `db:"nombre_perfil" json:"nombre_perfil"`
//}

type profile struct {
	Id        *int        `json:"id,omitempty"`
	IdProfile interface{} `json:"idperfil" validate:"required,notBlank"`
	Profile   *string     `json:"perfil,omitempty"`
}

const spEvaluator = "EVALUADOR"

func GetEvaluators(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	i := utils.GetQuery(r, "items", "")
	p := utils.GetQuery(r, "page", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	result, err := user.Sql.Page(spEvaluator+"_L",
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

func validatePhones(phones interface{}) interface{} {
	if phones != nil {
		ph := phones.([]interface{})
		if len(ph) > 0 {
			first := false
			for _, i := range ph {
				if i.(map[string]interface{})["principal"] == true {
					first = true
				}
			}

			if !first {
				ph[0].(map[string]interface{})["principal"] = true
			}
			return phones
		}
	}
	return nil
}

func CreateUpdateEvaluator(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body evaluatorBody
	var id interface{}
	id = utils.GetIntVar(r, "id")
	if id == 0 {
		id = nil
	}
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	/////////////////////
	var p profile
	d, err := json.Marshal(body.Profile)
	 err = json.Unmarshal(d, &p)
	if err != nil {
		return httpmessage.Error(err)
	}

	////////////////////////////
	if valid, errors := validator.Validate(p); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	body.Phone = validatePhones(body.Phone)
	id, err = user.Sql.ExecJson(spEvaluator+constants.InsertUpdateSuffix,
		user.CompanyId,
		id,
		utils.JsonString(body),
		user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(id, raw)

}

func GetEvaluatorDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body []evaluatorBody
	err := user.Sql.SelectProcedure(&body, spEvaluator+constants.DetailSuffix, user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	if len(body) > 0 {
		var iBody = body[0]
		body[0].Phone = utils.ToJson(iBody.Phone)
		body[0].Emails = utils.ToJson(iBody.Emails)
		body[0].Profile = utils.ToJson(iBody.Profile)
		body[0].Data = utils.ToJson(iBody.Data)
		body[0].Meta = utils.ToJson(iBody.Meta)
		return httpmessage.Raw(body[0])
	}
	return httpmessage.Send(body)
}

// USERS ?
//func GetUser(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
//	var body []userBody
//	err := user.Sql.Select(&body, fmt.Sprintf(`
//	select u.id,u.nombre, u.usuario, u.habilitado, u.fecha_creacion, up.idperfil, pf.nombre as 'nombre_perfil' from TMUSUARIO U
//	inner join TMUSUARIO_PERFIL up on up.idusuario = u.id
//	inner join TMPERFIL pf on pf.id = up.idperfil
//	where u.id = '%v'
//`, user.UserId))
//	if err != nil {
//		return httpmessage.Error(err)
//	}
//	return httpmessage.Send(body)
//}

func DeleteEvaluator(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(spEvaluator+"_D", user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

// Responsable
func GetEvaluador(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var evaluador []responsableBody
	err := user.Sql.Select(&evaluador, `select E.id ,U.nombre , E.codigo, E.fecha_creacion from TMEVALUADOR E
	JOIN TMUSUARIO_PERFIL UP ON UP.id = E.idusuario_perfil
	JOIN TMUSUARIO U ON U.id = UP.idusuario `)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(evaluador)
}
