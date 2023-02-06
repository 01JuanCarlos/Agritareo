package controllers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/smtp"
	"ns-api/common/constants"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/services/mongodb"
	"ns-api/core/services/mssql"
	"ns-api/core/sts"
	"ns-api/locale"
	"regexp"
	"strconv"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
)

const (
	SUGGEST_QUERY_PARAM = "q"
	SUGGEST_CID_PARAM   = "cid"
	SUGGEST_CODE_PARAM  = "c"
)

type Suggest struct {
	ID          interface{} `json:"id"`
	Code        interface{} `json:"code,omitempty"`
	Label       string      `json:"label,omitempty"`
	Description interface{} `json:"description,omitempty"`
	Icon        interface{} `json:"icon,omitempty"`
	Badge       string      `json:"badge,omitempty"`
}

type Headers struct {
	Field  string `json:"campo"`
	Type   string `json:"tipo"`
	Column int    `json:"columna"`
}

func GetRowsTable(query string, db *mssql.DatabaseConnection) (result []Headers, e error) {
	rows, err := db.Queryx(query)
	if err != nil {
		e = err
		return
	}
	ctt, _ := rows.ColumnTypes()
	for i, ct := range ctt {
		var name string
		// ------- Campos Mssql
		switch ct.DatabaseTypeName() {
		case "VARCHAR":
			name = "string"
		case "INT", "SMALLINT", "REAL", "FLOAT", "DECIMAL":
			name = "number"
		case "BIT":
			name = "boolean"
		case "DATETIME":
			name = "date"
		default:
			name = ct.DatabaseTypeName()
		}
		// ----------
		result = append(result, Headers{Field: ct.Name(), Type: name, Column: i})
	}
	return
}

func GestSuggest(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var re = regexp.MustCompile(`'`)
	q := utils.GetQuery(r, "q", "")
	cid := utils.GetQuery(r, "cid", "").(string)
	q = re.ReplaceAllString(q.(string), ``)
	//procedure := utils.GetQuery(r, "id")
	limit := utils.GetQuery(r, "l", "10")
	filter := utils.GetQuery(r, "f")
	code := utils.GetQuery(r, "c")
	advanced, _ := strconv.Atoi(utils.GetQuery(r, "a", "0").(string))
	//p := utils.GetQuery(r, "p", "").(string) // cuando se necesiten enviar mas pametros se enviaran en esta variable
	// FIXME ACOMODA DOGA
	advancedFilter := utils.GetQuery(r, "af", "").(string)
	if advancedFilter == "null" {
		advancedFilter = ""
	}
	var afQuery string // advancedFilter to Query

	var err error
	query, proc, err := user.Sql.SuggestAut(cid, user.CompanyId, q.(string), limit, advanced, afQuery, filter)
	if err != nil {
		return httpmessage.Error(err)
	}
	//paramsOther := fmt.Sprintf(`{"idusuario": %v , "params" : %v }`, user.UserId, filter)
	var queryExec string
	if proc == 1 {
		query := fmt.Sprintf(`EXEC NS_%v%v '%v','%v','%v',%v,'%v','%v'`,
			query,
			constants.PGetSuggest,
			user.CompanyId,
			q,
			limit,
			advanced,
			afQuery,
			filter)
		queryExec = query
	} else {
		queryExec = query
	}
	//SE ARMA EL FILTRO AVANZADO
	if advancedFilter != "" {
		// -----
		decode, _ := base64.URLEncoding.DecodeString(advancedFilter)
		var af []map[string]interface{}
		err := json.Unmarshal(decode, &af)
		if err != nil {
			//log.Println("ERROR:", err)
			return httpmessage.Error(locale.SomethingBadHappened)
		}
		filtrox := map[string]string{
			"1": "=",
			"2": "IN",
			"3": "<>",
			"4": "LIKE",
			"5": ">",
			"6": "<",
		}

		result, err := GetRowsTable(queryExec, user.Sql)
		if err != nil {
			return httpmessage.Error(err)
		}
		var valueColumn string
		for _, i := range af {
			filtro, ok := filtrox[i["filter"].(string)]
			if !ok {
				filtro = i["filter"].(string)
			}
			for _, value := range result {
				if value.Column == int(i["column"].(float64)) {
					valueColumn = value.Field
				}
			}
			query := fmt.Sprintf(`AND %v %v (''%v'') `, valueColumn, filtro, i["value"])
			afQuery = afQuery + query
		}
		afQuery = strings.Replace(afQuery, "AND ", "", 1)
	}

	//FIXME: BORRAR ESTA SONCERA -> PARAMS -> SUGGEST
	if code == nil {
		code = ""
	} else if code != "" {
		q = code
	}

	if advanced != 0 && afQuery == "" {
		//OBTIENE LOS CAMPOS DE LA TABLA PARA GENERAR LOS FILTROS AVANZADOS
		result, err := GetRowsTable(queryExec, user.Sql)
		if err != nil {
			//log.Println(err)
			return httpmessage.Error(err)
		}
		return httpmessage.Send(result)
	} else {
		//EJECUTA LOS FILTROS AVANZADOS Y OBTIENE TODA LA DATA DE ACUERDO A ELLO
		if proc == 0 {
			query, _, err := user.Sql.SuggestAut(cid, user.CompanyId, q.(string), limit, advanced, afQuery, filter)
			if err != nil {
				return httpmessage.Error(err)
			}
			queryExec = query
		}


		result, err := user.Sql.Queryx(queryExec)
		if err != nil {
			return httpmessage.Error(err)
		}
		tb := make([]map[string]interface{}, 0)
		for result.Next() {
			ss := make(map[string]interface{})
			err := result.MapScan(ss)
			if err != nil {
				return httpmessage.Error(err)
			}
			tb = append(tb, ss)
		}
		if advanced == 0 {
			jsonbody, err := json.Marshal(tb)
			if err != nil {
				//fmt.Println(err)
			}
			var suggest []Suggest
			if err := json.Unmarshal(jsonbody, &suggest); err != nil {
				return httpmessage.Error(err)
			}
			return httpmessage.Send(suggest)
		}
		return httpmessage.Send(tb)
	}
}

func PostSettings(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	var data map[string]interface{}
	body, _ := ioutil.ReadAll(r.Body)
	_ = json.Unmarshal(body, &data)

	db, _ := mongodb.DB.GetConnection(user.CorporationId)
	_, err := db.Save("settings", bson.M{
		"userId":        user.UserId,
		"corporationId": user.CorporationId,
		"companyId":     user.CompanyId,
		"componentId":   id,
		"data":          data,
	})

	if err != nil {
		//fmt.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

func GetSettings(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	db, _ := mongodb.DB.GetConnection(user.CorporationId)
	result := db.FindOne("settings", bson.M{"componentId": id}, mongodb.QueryOptions{
		Select: bson.M{
			"_id":           0,
			"componentId":   0,
			"columns":       1,
			"formats":       1,
			"configuracion": 1,
		},
	})
	return httpmessage.Send(result)
}

// FIXME
type privilegesBody struct {
	ProfileID int         `json:"idperfil" validate:"required"`
	Data      interface{} `json:"data" validate:"required"`
}
type getPrivilegesBody struct {
	ID          string `json:"id"`
	Label       string `json:"label"`
	Description string `json:"description"`
}

func GetPrivileges(user *sts.Client) httpmessage.HttpMessage {
	var profile []getPrivilegesBody
	err := user.Sql.Select(&profile,
		`SELECT id,
				nombre AS label,
				descripcion AS description 
				FROM TMTIPO_PRIVILEGIOS WHERE habilitado = 1`)
	if err != nil {
		// return utils.ErrorMessage(locale.SomethingBadHappened, http.StatusInternalServerError)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(profile)
}

func PostPrivileges(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var privileges privilegesBody
	_ = utils.ParseBody(r, &privileges)
	raw, err := user.Sql.ExecJson(constants.PInsertComponentProfile,
		user.CompanyId, privileges.ProfileID, utils.JsonString(privileges.Data))
	if err != nil {
		return httpmessage.Empty()
	}
	// fixme
	return httpmessage.Log(raw)

}

// email
type emailBody struct {
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Message string   `json:"message"`
}

func PostEmail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var email emailBody
	_ = utils.ParseBody(r, &email)
	to := email.To
	emails := strings.Join(to, ",")
	msg := email.Message
	title := email.Subject
	from := "mail.systems.ns@gmail.com"
	auth := smtp.PlainAuth("", from, "nstest1234", "smtp.gmail.com")
	txt := "From: " + from + "\n" +
		"To: " + emails + "\n" +
		"Subject:" + title + "\n\n" +
		msg
	msgFormat := []byte(txt)
	err := smtp.SendMail("smtp.gmail.com:587",
		auth,
		from,
		to,
		msgFormat)
	if err != nil {
		logger.Error(`Fail MAIL : %v`, err.Error())
		return httpmessage.Error(locale.SomethingBadHappened)
	}
	logger.Info("SEND MAIL: %v", emails)
	return httpmessage.Empty()
}

// table Config FIXME
type tableConfig struct {
	Id    string `json:"id"`
	Label string `json:"label"`
}

func GetTableFormat(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var tconfig []tableConfig
	id := utils.GetVar(r, "id")
	err := user.Sql.SelectProcedure(&tconfig, constants.TableFormat, user.CompanyId, id)
	if err != nil {
		//log.Println(err)
		//return utils.ErrorMessage(locale.SomethingBadHappened)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(tconfig)
}

func PutTableConfig(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	data, _ := ioutil.ReadAll(r.Body)
	var validate interface{}
	err := json.Unmarshal(data, &validate)
	if err != nil {
		return httpmessage.Error(locale.MissingFields, fmt.Sprintf("%v", err))
	} else if len(validate.(map[string]interface{})) < 1 {
		return httpmessage.Error(locale.MissingFields, "data not found")
	}
	err = mongodb.UpsertOne(fmt.Sprintf(`table-config%v`, user.CompanyId), id, user.UserId, data)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(validate)
}

func GetTableConfig(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	db, _ := mongodb.DB.GetConnection(user.CorporationId)
	result := db.FindOne("table-config", bson.M{"componentId": id})
	return httpmessage.Send(result)
}

func GetOldSuggest(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var sugest []Suggest
	q := utils.GetQuery(r, "q", "")
	// --------
	var re = regexp.MustCompile(`'`)
	q = re.ReplaceAllString(q.(string), ``)
	// --------
	procedure := utils.GetQuery(r, "id")
	limit := utils.GetQuery(r, "l", "10")
	// filter := utils.GetQuery(r, "f")
	code := utils.GetQuery(r, "c")
	advanced, _ := strconv.Atoi(utils.GetQuery(r, "a", "0").(string))
	// FIXME ACOMODA DOGA
	advancedFilter := utils.GetQuery(r, "af", "").(string)
	if advancedFilter == "null" {
		advancedFilter = ""
	}
	//fmt.Println("adv", advancedFilter)
	var afQuery string // advancedFilter to Query

	//SE ARMA EL FILTRO AVANZADO
	if advancedFilter != "" {
		// -----
		decode, _ := base64.URLEncoding.DecodeString(advancedFilter)
		var af []map[string]interface{}
		err := json.Unmarshal(decode, &af)
		if err != nil {
			//log.Println("ERROR:", err)
			return httpmessage.Error(locale.SomethingBadHappened)
		}
		filtrox := map[string]string{
			"1": "=",
			"2": "IN",
			"3": "<>",
			"4": "LIKE",
			"5": ">",
			"6": "<",
		}
		query := fmt.Sprintf(`EXEC NS_%v%v '%v', '%v', '%v', '%v', '%v'`,
			procedure,
			constants.PGetSuggest,
			user.CompanyId,
			q,
			limit,
			advanced,
			"")
		result, err := GetRowsTable(query, user.Sql)
		if err != nil {
			return httpmessage.Error(err)
		}
		var valueColumn string
		for _, i := range af {

			filtro, ok := filtrox[i["filter"].(string)]
			if !ok {
				filtro = i["filter"].(string)
			}
			for _, value := range result {
				if value.Column == int(i["column"].(float64)) {
					valueColumn = value.Field
				}
			}
			query := fmt.Sprintf(`AND %v %v (''%v'') `, valueColumn, filtro, i["value"])
			afQuery = afQuery + query
		}
		afQuery = strings.Replace(afQuery, "AND ", "", 1)
	}
	//FIXME BORRAR ESTA SONCERA -> PARAMS -> SUGGEST
	if code == nil {
		code = ""
	} else if code != "" {
		q = code
	}
	var err error
	if advanced != 0 && afQuery == "" {
		//OBTIENE LOS CAMPOS DE LA TABLA PARA GENERAR LOS FILTROS AVANZADOS
		query := fmt.Sprintf(`EXEC NS_%v%v '%v', '%v', '%v', '%v', '%v'`,
			procedure,
			constants.PGetSuggest,
			user.CompanyId,
			q,
			limit,
			advanced,
			afQuery)

		result, err := GetRowsTable(query, user.Sql)
		if err != nil {
			//log.Println(err)
			return httpmessage.Error(err)
		}
		return httpmessage.Send(result)
	}
	query := fmt.Sprintf(`EXEC NS_%v%v '%v','%v','%v',%v,'%v'`,
		procedure,
		constants.PGetSuggest,
		user.CompanyId,
		q,
		limit,
		advanced,
		afQuery)

	result, err := user.Sql.Queryx(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	tb := make([]map[string]interface{}, 0)
	for result.Next() {
		ss := make(map[string]interface{})
		err := result.MapScan(ss)
		if err != nil {
			//fmt.Println(err)
			return httpmessage.Error(locale.SomethingBadHappened)
		}
		tb = append(tb, ss)
	}
	if advanced == 0 {
		jsonbody, err := json.Marshal(tb)
		if err != nil {
			return httpmessage.Error(err)
		}
		//suggest := []Suggest{}
		if err := json.Unmarshal(jsonbody, &sugest); err != nil {
			logger.Debug(err)
		}
		//return httpmessage.Send(suggest)
	}
	return httpmessage.Send(sugest)
}
