package agritareo

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"strconv"
	"strings"
	"time"
)

type clima struct {
	Id            int         `db:"id" json:"id,omitempty" validate:"required,notBlank"`
	Idcentrocosto int         `db:"idcentrocosto" json:"idcentrocosto,omitempty" validate:"required,notBlank"`
	Humedad       int         `db:"humedad" json:"humedad,omitempty" validate:"required,notBlank"`
	Descripcion   string      `db:"descripcion" json:"descripcion,omitempty" validate:"required,notBlank"`
	Icon          string      `db:"icon" json:"icon,omitempty"`
	Velocidad     int         `db:"velocidad" json:"velocidad,omitempty" validate:"required,notBlank"`
	Grados        int         `db:"grados" json:"grados,omitempty" validate:"required,notBlank"`
	Timezone      int         `db:"timezone" json:"timezone" validate:"required,notBlank"`
	Dia           time.Time   `db:"dia" json:"dia,omitempty" validate:"required,notBlank"`
	Nombre        string      `db:"nombre" json:"nombre"`
	Temperatura   float32     `db:"temperatura" json:"temperatura,omitempty"`
}

func GetClimate(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//id := utils.GetIntVar(r, "id")
	var body []clima
	query := ` select TOP 1 id, idcentrocosto , humedad, descripcion, icon, velocidad, grados, timezone, dia, nombre,temperatura from tmclima ORDER BY id DESC`
	println(query)
	err := user.Sql.Select(&body, query)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(body)
}

const (
	spClimate = "CLIMA"

)

func GetTableClima(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	p := utils.GetQuery(r, "page", "")
	i := utils.GetQuery(r, "items", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	//fi := utils.GetQuery(r, "fi", "")
	//ff := utils.GetQuery(r, "ff", "")

	result, err := user.Sql.Page(
		fmt.Sprintf(`%v`, spClimate+constants.ListSuffix),
		user.CompanyId,
		i,
		p,
		s,
		o,
		//fi,
		//ff,
	)
	if nil != err {
		return httpmessage.Error(err)
	}

	data := result.Data.([]map[string]interface{})
	for _, i := range data {
		i["velocidad"], _ = (strconv.ParseFloat(string(i["velocidad"].([]uint8)), 64))
		i["temperatura"], _ = (strconv.ParseFloat(string(i["temperatura"].([]uint8)), 64))

	}
	return httpmessage.Page(
		result.Data,
		result.TotalFiltered,
		result.TotalRows,
	)
}

type loteClimaBodyDetail struct {
	Name          string      `json:"nombre"`
	Fecha         string      `json:"fecha"`
	IdCentroCosto interface{} `json:"idcentrocosto"`
	Value         float64     `json:"valor"`
}


type climaBody struct {
	Id   *int    `db:"id" json:"id"`
	Name *string `db:"nombrenivel" json:"nombrenivel"`
}


func GetLoteClima(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var zona []climaBody
	err := user.Sql.Select(&zona, `select distinct CC.id ,CC.nombrenivel  
	from tmcentrocosto CC
	LEFT JOIN TMCLIMA R ON R.idcentrocosto = CC.id
	where CC.id = R.idcentrocosto`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(zona)
}

func GetClimaMultiDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//ids := utils.Get(r, "ids", "").(string)
	ids := utils.GetVar(r, "ids")
	var body []loteClimaBodyDetail
	// inputs
	var f1, f2 interface{}
	f1 = dateFunc(utils.GetQuery(r, "i", "").(string))
	f2 = dateFunc(utils.GetQuery(r, "f", "").(string))
	//---------------------------------
	layout := "2006-01-02"
	f1ToDate, err := time.Parse(layout, f1.(string))
	//f2ToDate, err := time.Parse(layout, f2.(string))
	//f1week := f1ToDate.Add(-168 * time.Hour)
	f2week := f1ToDate.Add(-336 * time.Hour)
	fechaFinal := f2week.Format("2006-01-02")
	decoId, _ := base64.StdEncoding.DecodeString(ids)
	stringId := string(decoId)
	//fmt.Println(stringId)
	if err != nil {
		return httpmessage.Error(err)
	}
	q := fmt.Sprintf(`
							SELECT DISTINCT
								RCD.idcentrocosto,
								RCD.nombrecentrocosto AS nombre,
								NULLIF(CEILING(temperatura), 0) as valor,
								RCD.dia as fecha
							FROM TMCLIMA RCD
							JOIN TMCENTROCOSTO CC ON CC.idempresa = RCD.idempresa
							WHERE CC.idempresa = %v
							AND RCD.idcentrocosto in (%v)
							AND IIF(RCD.idcentrocosto IS NOT NULL, RCD.dia, '%v') BETWEEN '%v' AND '%v'
							order BY RCD.dia
							FOR JSON auto`, user.CompanyId, stringId, fechaFinal, fechaFinal, f2)
	//fmt.Println(q)
	result, err := user.Sql.Query(q)
	if err != nil {
		return httpmessage.Error(err)
	}
	var resultString string
	for result.Next(){
		var key = ""
		err = result.Scan(&key)
		if err != nil {
			return httpmessage.Error(err)
		}
		resultString = resultString + key
	}
	err = json.Unmarshal([]byte(resultString), &body)
	if err != nil {
		return httpmessage.Error(err)
	}
	var fechas []string
	var dataset []dataChart

	for _, i := range body {
		p := strings.TrimSpace(i.Name)
		b := fmt.Sprintf("%#v\n", p)
		o := strings.Split(b, "\\")
		e := strings.TrimLeft(o[0],
			`"`)
		//s, err := strconv.ParseFloat(i.Value, 64)
		if err != nil {
			return httpmessage.Error(err)
		}
		ok, inx := validateDataSet(dataset, e)
		if ok {
			dataset[inx].Value = append(dataset[inx].Value, i.Value)
		} else {
			dataset = append(dataset, dataChart{
				Name:  e,
				Value: []float64{i.Value},
				Color: hex[rand.Intn(7)],
			})
		}
		ok = validateFecha(fechas, i.Fecha)
		if ok {

		} else {
			fechas = append(fechas, i.Fecha)
		}
	}

	var df = fechaGraphicFitosanidad{
		Fecha:   fechas,
		Dataset: dataset,
	}

	return httpmessage.Send(df)
}

/*
func CreateClima(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body climaBody
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	id, err := user.Sql.Exec(constants.CInsertClima, body.Humedad,
		body.Descripcion, body.Icon, body.Speed, body.Deg, body.Timezone)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(id.Result[0], raw)
}
*/

/*func Climate(lat, lon, id interface{}) (string, error) {
	var climate climaBody

	url := fmt.Sprintf(`http://api.openweathermap.org/data/2.5/weather?lat=%v&lon=%v&appid=%v`, lat, lon, "f6cecccfc95d360dd9a45b322fce04f4")
	resp, err := http.Get(url)
	if err != nil {
		log.Println(err)
		return "", err
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(body))
	err = json.Unmarshal(body, &climate)
	if err != nil {
		log.Println(err)
		return "", err
	}
	fmt.Println(climate)
	start := time.Now()
	fmt.Println(start)
	d := time.Date(start.Year(), start.Month(), start.Day(), 6, start.Minute(), start.Second(), start.Nanosecond(), time.UTC)
	year, month, day := d.Date()

	fmt.Printf("year = %v\n", year)
	fmt.Printf("month = %v\n", month)
	fmt.Printf("day = %v\n", day)
	query := fmt.Sprintf(`exec ns_%v,%v,%v,%v,%v,%v,%v,%v `, constants.CInsertClima, climate.Main.Humidity,
		climate.Weather[0].Description, climate.Weather[0].Icon, climate.Wind.Speed, climate.Wind.Deg, climate.Timezone, id)
	return query, nil
	DurationOfTime := time.Duration(60) * time.Minute
	f := func() {
		fmt.Println("Function called by " +
			"AfterFunc() after 60 minutes")
	}
	Timer1 := time.AfterFunc(DurationOfTime, f)
	defer Timer1.Stop()
	time.Sleep(10 * time.Second)
	_, err = user.Sql.Exec(constants.CInsertClima, climate.Main.Humidity,
		climate.Weather[0].Description, climate.Weather[0].Icon, climate.Wind.Speed, climate.Wind.Deg, climate.Timezone, id)
	if err != nil {
		log.Println(err)
		return err
	}
}*/