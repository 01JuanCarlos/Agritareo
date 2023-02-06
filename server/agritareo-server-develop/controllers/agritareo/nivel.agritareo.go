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

type companyLevelBody struct {
	Id                   int         `db:"id" json:"id,omitempty"`
	IdCentroCostoPadre   *int        `db:"idcentrocostopadre" json:"parent_id"`
	IdNivelConfiguracion int         `db:"idnivelconfiguracion" json:"idnivelconfiguracion"`
	NombreNivel          string      `db:"nombrenivel" json:"nombrenivel"`
	IdEmpresa            int         `db:"idempresa" json:"idempresa"`
	Codigo               string      `db:"codigo" json:"codigo"`
	Latitud              interface{} `db:"latitud" json:"latitud"`
	Longitud             interface{} `db:"longitud" json:"longitud"`
	Idnivel              int         `json:"idnivel"`
	Referencia           int         `db:"referencia" json:"referencia"`
	IdSiembra            *int        `db:"idsiembra" json:"idsiembra"`
	CodigoSiembra        interface{} `db:"codigo_siembra" json:"codigo_siembra"`
	Hectarea             *float32    `db:"area" json:"area"`
	Coordenadas          interface{} `db:"coordenadas" json:"coordenadas"`
	IdCultivo            *int        `db:"idcultivo" json:"idcultivo"`
	NombreCultivo        interface{} `db:"nombrecultivo" json:"nombrecultivo"`
	CodigoCultivo        interface{} `db:"codigocultivo" json:"codigocultivo"`
	IdVariedad           *int        `db:"idvariedad" json:"idvariedad"`
	NombreVariedad       interface{} `db:"nombrevariedad" json:"nombrevariedad"`
	CodigoVariedad       interface{} `db:"codigovariedad" json:"codigovariedad"`
	IdCampania           *int        `db:"idcampania" json:"idcampania"`
	CodigoCampania       interface{} `db:"codigocampania" json:"codigocampania"`
	FechaInicioCampania  interface{} `db:"fechainiciocampania" json:"fechainiciocampania"`
	FechaFinCampania     interface{} `db:"fechafincampania" json:"fechafincampania"`
	Pg_TotalRows         int         `db:"pg_TotalRows" json:"pg_TotalRows"`
	Pg_totalFiltered     int         `db:"pg_totalFiltered" json:"pg_totalFiltered"`
}

type nivelConfiguracionJsonBody struct {
	Data interface{} `json:"nivelesconfiguracion"`
}

type nivelSeleccionableBody struct {
	IdNivel     int    `db:"idnivel" json:"id,omitempty"`
	NombreNivel string `db:"nombrenivel" json:"label"`
}

type levelBody struct {
	IdNivel      int `db:"idnivel" json:"idnivel, omitempty"`
	IdNivelPadre int `db:"idnivelpadre" json:"idnivelpadre,omitempty"`
}

type lastChildLevelBody struct {
	IdEmpresa            int `db:"idempresa" json:"idempresa,omitempty"`
	IdNivel              int `db:"idnivel" json:"idnivel, omitempty"`
	IdNivelPadre         int `db:"idnivelpadre" json:"idnivelpadre,omitempty"`
	IdNivelConfiguracion int `db:"idnivelconfiguracion" json:"idnivelconfiguracion,omitempty"`
}

func GetLastChildLevel(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var companyLevel []lastChildLevelBody
	err := user.Sql.SelectProcedure(&companyLevel, constants.PLastChildLevel, user.CompanyId)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(companyLevel)
}

func GetCompanyLevels(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var companyLevel []companyLevelBody
	err := user.Sql.SelectProcedure(&companyLevel, constants.PListCompanyLevels, user.CompanyId)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(companyLevel)
}

func GetCompanyLevelsByParent(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var companyLevel []companyLevelBody
	//parentId := utils.GetQuery(r, "parentId")
	err := user.Sql.SelectProcedure(&companyLevel, constants.PListCompanyLevels, user.CompanyId)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(companyLevel)
}

func PostConfigurationLevel(user *sts.Client, r *http.Request) *sts.HttpResponse {
	var body nivelConfiguracionJsonBody
	raw := utils.ParseBody(r, &body)
	//fmt.Println("fail", body)

	if valid, errors := validator.Validate(body); !valid {
		return server.ErrorMessage(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PInsertConfigurationLevel, user.CompanyId, body.Data)
	if err != nil {
		log.Println(err)
		return server.ErrorMessage(err)
	}
	//log.Println("Sucursal Registrada")
	return server.EmptyMessage(raw)
}

func PostConfigurationLevelS(user *sts.Client, r *http.Request) *sts.HttpResponse {
	var body levelBody
	raw := utils.ParseBody(r, &body)
	//fmt.Println("fail", body)
	var nivelPadre interface{}
	if body.IdNivelPadre == 0 {
		nivelPadre = nil
	} else {
		nivelPadre = body.IdNivelPadre
	}

	if valid, errors := validator.Validate(body); !valid {
		return server.ErrorMessage(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PInsertConfigurationLevel, body.IdNivel, nivelPadre)
	if err != nil {
		log.Println(err)
		return server.ErrorMessage(err)
	}
	//log.Println("Sucursal Registrada")
	return server.EmptyMessage(raw)
}

func GetConfigurationLevels(user *sts.Client, r *http.Request) *sts.HttpResponse {
	var nivelSeleccionable []nivelSeleccionableBody
	err := user.Sql.SelectProcedure(&nivelSeleccionable, constants.PListConfigurationLevels)
	if nil != err {
		return server.ErrorMessage(err)
	}
	return server.Message(nivelSeleccionable)
}

func GetCompanyLevelsConfiguration(user *sts.Client, r *http.Request) *sts.HttpResponse {
	var nivelSeleccionable []nivelSeleccionableBody
	err := user.Sql.SelectProcedure(&nivelSeleccionable, constants.PListCompanyLevelsConfiguration, user.CompanyId)
	if nil != err {
		return server.ErrorMessage(err)
	}
	return server.Message(nivelSeleccionable)
}
