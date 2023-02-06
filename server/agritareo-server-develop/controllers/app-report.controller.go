package controllers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/filemanager"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
)

type Report struct {
	IDFormato  interface{} `json:"idformato,omitempty"`
	Nombre     string      `json:"nombre"`
	Data       string      `json:"data"`
	Proc       string      `json:"proc"`
	Components string      `json:"components,omitempty"`
}

// ----- menu-setup
type menuBody struct {
	Name     string `json:"nombre"`
	IdModule int    `json:"idmodulo"`
}

//------format
type formatBody struct {
	FormatID  string          `json:"idformato"`
	Data      json.RawMessage `json:"json_componentes"`
	Procedure string          `json:"proc"`
}

// ---------
type FormatCompBody struct {
	CID  string          `json:"cid" validate:"required"`
	Data json.RawMessage `json:"dataFormato" validate:"required"`
}

// --------
type ComponentFormat struct {
	Id        string  `db:"id" json:"id,omitempty"`
	Name      string  `db:"label" json:"label,omitempty"` // ----
	CID       string  `db:"cid" json:"cid,omitempty"`
	Component string  `db:"componente" json:"componente,omitempty"`
	IDFormat  string  `db:"idformato" json:"idformato,omitempty"`
	Format    string  `db:"formato" json:"formato,omitempty"`
	Comm      *string `db:"comando" json:"comando"`
	CommValue *string `db:"comando_valor" json:"comando_valor"`
	Order     *int    `db:"orden" json:"orden"`
	Suffix    *string `db:"sufijo" json:"sufijo"`
}

func GetFormModules(user *sts.Client) httpmessage.HttpMessage {
	result, err := user.Sql.ExecJson(constants.PGetComponentsFormPrint, user.CompanyId)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func GetReport(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	code := utils.GetVar(r, "id")
	result, err := user.Sql.ExecJson(constants.PGetFormatsPrint, user.CompanyId, code)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func DeleteReport(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	_, err := user.Sql.ExecJson(constants.PDeleteFormatsPrint,
		user.CompanyId,
		id)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

func PutPreviewReport(r *http.Request, w http.ResponseWriter) httpmessage.HttpMessage {
	temp, _ := ioutil.ReadAll(r.Body)
	id, _ := utils.GeneratePDF(temp)
	w.Write([]byte(fmt.Sprintf(`key:%v`, id)))
	return httpmessage.Stream([]byte{}, "text/plain")
}

func GetPreReport(r *http.Request, w http.ResponseWriter) httpmessage.HttpMessage {
	id := utils.GetQuery(r, "key")
	f, err := filemanager.ReadPdfFile(fmt.Sprintf(`%v`, id))
	if err != nil {
		return httpmessage.Empty()
	}
	if _, err := w.Write(f); err != nil {
		return httpmessage.Empty()
	}

	return httpmessage.Stream([]byte{}, "application/pdf")
}

func PostReport(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var report Report
	_ = utils.ParseBody(r, &report)
	query := fmt.Sprintf(`
	declare @codigo char(22)
	declare @idformato int
	EXEC NS_FORMATOSIMPRESION_I '%v', '%v', '%v', '%v','%v' , @codigo OUTPUT, @idformato OUTPUT; SELECT codigo = @codigo, idformato = @idformato;`, user.CompanyId, report.Nombre, report.Data, report.Proc, report.Components)
	rows, err := user.Sql.Queryx(query)

	if err != nil {
		return httpmessage.Error(err)
	}
	defer rows.Close()
	var v1 string
	var v2 string
	for rows.Next() {
		err := rows.Scan(&v1, &v2)
		if err != nil {
			return httpmessage.Error(err)
		}
	}
	return httpmessage.Send(struct {
		Code string `json:"codigo"`
	}{
		Code: v1,
	})
}

func PutReport(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	code := utils.GetVar(r, "id")
	var report Report
	_ = utils.ParseBody(r, &report)
	result, err := user.Sql.ExecJson(constants.PUpdateFormatsPrint,
		user.CompanyId,
		code,
		report.Nombre,
		report.Data,
		report.Proc,
		report.Components)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func PostMenuSetup(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body menuBody
	_ = utils.ParseBody(r, &body)
	_, err := user.Sql.ExecJson(constants.PMenuIU,
		user.CompanyId,
		utils.JsonString(body))
	if err != nil {
		return httpmessage.Empty()
	}
	return httpmessage.Empty()
}

// Components
func GetComponents(user *sts.Client) httpmessage.HttpMessage {
	result, err := user.Sql.ExecJson(constants.PGetComponents, user.CompanyId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func PostComponentFormat(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body formatBody
	id := utils.GetVar(r, "id")
	raw := utils.ParseBody(r, &body)
	body.FormatID = id
	_, err := user.Sql.ExecJson(constants.PInsertComponentsFormat,
		user.CompanyId,
		body.FormatID,
		utils.JsonString(body.Data))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func GetComponentFormat(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	var components []ComponentFormat
	err := user.Sql.SelectProcedure(&components, constants.PGetComponentsFormat, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(components)
}

func GetFormatComponent(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	var fComponents []ComponentFormat
	err := user.Sql.SelectProcedure(&fComponents, constants.PGetFormatComponent, user.CompanyId, id)
	if err != nil {
		return httpmessage.Error(err)
	}
	if len(fComponents) != 0 {
		return httpmessage.Send(fComponents)
	}
	return httpmessage.Json("[]")
}

func PostFormatComponent(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body FormatCompBody
	_ = utils.ParseBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	query := fmt.Sprintf(`
	declare @id char(22)
	EXEC NS_FORMATOCOMPONENTE_I '%v', '%v', '%v', @id OUTPUT; SELECT id = @id;`, user.CompanyId, body.CID, string(body.Data))
	rows, err := user.Sql.Queryx(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	defer rows.Close()
	var v1, v2 string
	for rows.Next() {
		err := rows.Scan(&v1, &v2)
		if err != nil {
			return httpmessage.Error(err)
		}
	}
	return httpmessage.Send(struct {
		ID string `json:"id"`
	}{
		ID: v1,
	})
}
