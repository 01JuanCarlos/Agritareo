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
	"ns-api/controllers/agritareo/entity/binnacle"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"strings"
	"time"
)

type loteRiegoBodyDetail struct {
	Name          string      `json:"nombre"`
	Fecha         string      `json:"fecha"`
	IdCentroCosto interface{} `json:"id"`
	Value         float64     `json:"valor"`
	Unit          string      `json:"unidad_medida"`
}

type loteGraficoAguaDetail struct {
	Name          string      `json:"C_Costo"`
	Fecha         string      `json:"fecha"`
	IdCentroCosto interface{} `json:"id"`
	Value         float64     `json:"valor"`
}
const (
	spIrrigation     = "BITACORA_RIEGO"
	spAgua           = "BITACORA_AGUA"
	spLoteIrrigation = "LOTE_RIEGO"
	spLoteAgua       = "LOTE_AGUA"
	spIrrigationData = "REPORTE_RIEGO"

	spGraficoAgua	 = "GRAFICO_CONSUMO_AGUA"
)

// RIEGO X LOTE
// FILTRO DE TABLA
func GetLoteRiego(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var lote []loteRiegoBody
	err := user.Sql.SelectProcedure(&lote, spLoteIrrigation+constants.ListSuffix, user.CompanyId)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(lote)
}

// DATA DE LA TABLA
func GetTableIrrigation(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	p := utils.GetQuery(r, "page", "")
	i := utils.GetQuery(r, "items", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	lote := utils.GetQuery(r, "lote", "")

	//fi := utils.GetQuery(r, "fi", "")
	//ff := utils.GetQuery(r, "ff", "")

	result, err := user.Sql.Page(
		fmt.Sprintf(`%v`, spIrrigation+constants.ListSuffix),
		user.CompanyId,
		i,
		p,
		s,
		o,
		lote,
		//fi,
		//ff,
	)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Page(
		result.Data,
		result.TotalFiltered,
		result.TotalRows,
	)
}


// GRAFICO DE RIEGO X LOTE
func GetTableIrrigationDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")

	var body []loteRiegoBodyDetail
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
	if err != nil {
		return httpmessage.Error(err)
	}
	result, err := user.Sql.ExecJson(spIrrigation+constants.DetailSuffix,
		user.CompanyId,
		user.UserId,
		fechaFinal,
		f2,
		id)
	if err != nil {
		return httpmessage.Error(err)
	}
	err = json.Unmarshal([]byte(result), &body)
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

// multiselect riego
func GetTableIrrigationMultiDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//ids := utils.Get(r, "ids", "").(string)
	ids := utils.GetVar(r, "ids")
	var body []loteRiegoBodyDetail
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
							SELECT
								distinct
								RI.id,
								CONCAT(TRIM(nombre),'  -  ', area, ' Ha')as nombre,
								CEILING(RI.valor) as valor,
								RI.fecha,
								RI.unidad_medida
							FROM TMRIEGO RI
							JOIN TMCENTROCOSTO CC ON CC.idempresa = RI.idempresa
							WHERE CC.idempresa = %v
							AND RI.idcentrocosto in (%v)
							AND IIF(RI.id IS NOT NULL, RI.fecha, '%v') BETWEEN '%v' AND '%v'
							order BY RI.fecha
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

// MAPA RIEGO GO
func GetIrrigationReport(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//var f1, f2 interface{}
	var pd binnacle.PhytosanityDates
	pd.FechaInicio = utils.GetQuery(r, "i", "").(string)
	pd.FechaFin = utils.GetQuery(r, "f", "").(string)
	if pd.FechaInicio != "" || pd.FechaFin != "" {
		err := pd.Validate()
		if err != nil {
			return httpmessage.Error(err)
		}
	} else {
		fechanow := time.Now()
		// utilizar este por si quiero hacer de un año atras
		//fechalast := fechanow.AddDate(0,0,0)
		pd.FechaFin = fmt.Sprintf(`%v/%v/%v`, fechanow.Year(), int(fechanow.Month()), fechanow.Day())
		pd.FechaInicio = fmt.Sprintf(`%v/%v/%v`, fechanow.Year(), int(fechanow.Month()), 1)
	}
	fmt.Println(pd)
	result, err := user.Sql.ExecJson(spIrrigationData+constants.DetailSuffix,
		user.CompanyId,
		user.UserId,
		pd.FechaInicio,
		pd.FechaFin)
	if err != nil {
		fmt.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

//CONSUMO AGUA
// FILTRO CONSUMO AGUA
func GetLoteAgua(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var lote []loteAguaBody
	err := user.Sql.SelectProcedure(&lote, spLoteAgua+constants.ListSuffix)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(lote)
}

// TOTALES DE CONSUMO AGUA
func GetTotalAgua(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var zona []AguaTotalBody
	err := user.Sql.Select(&zona, `select 
											SUM(Area) Areatotal,
											SUM(Horas_Riego_Acumuladas) Horas_Riego_AcumuladasTotal,
											SUM(Volumen_Acumulado) Volumen_AcumuladoTotal,
											SUM(Horas_Riego_Acumuladas_Ha) Horas_Riego_Acumuladas_HaTotal, 
											SUM(Volumen_Acumulado_Ha) Volumen_Acumulado_HaTotal, 
											SUM(Nro_dias_riego) Nro_dias_riegoTotal, 
											Periodo from TMRIEGO_CONSUMO_DIARIO
											group by Periodo`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(zona)
}

// DATA DE TABLA CONSUMO AGUA

func GetTableAgua(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	p := utils.GetQuery(r, "page", "")
	i := utils.GetQuery(r, "items", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	lote := utils.GetQuery(r, "lote", "")

	//fi := utils.GetQuery(r, "fi", "")
	//ff := utils.GetQuery(r, "ff", "")

	result, err := user.Sql.Page(
		fmt.Sprintf(`%v`, spAgua+constants.ListSuffix),
		user.CompanyId,
		i,
		p,
		s,
		o,
		lote,
		//fi,
		//ff,
	)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Page(
		result.Data,
		result.TotalFiltered,
		result.TotalRows,
	)
}

// GRAFICO CONSUMO AGUA
// GRAFICO DE RIEGO X LOTEE

type dataChartIrrigation struct {
	Name  string    `json:"label"`
	Value []float64 `json:"data"`
	Color string    `json:"backgroundColor"`
}

type fechaGraphicIrrigation struct {
	Fecha   []string         `json:"labels"`
	Dataset []dataChartIrrigation `json:"dataset"`
}

func validateDataSetIrrigation(d []dataChartIrrigation, i string) (res bool, inx int) {
	for k, x := range d {
		if x.Name == i {
			return !res, k
		}
	}
	return
}

func GetConsumoAguaDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	filtros := map[string]string{
		"1": "Volumen_Acumulado",
		"2": "Horas_Riego_Acumuladas",
		"3": "Volumen_Acumulado_Ha",
		"4": "Horas_Riego_Acumuladas_Ha",
	}
	id := utils.GetIntVar(r, "id")
	var body []loteGraficoAguaDetail
	// inputs
	var f1, f2 interface{}
	f1 = dateFunc(utils.GetQuery(r, "i", "").(string))
	f2 = dateFunc(utils.GetQuery(r, "f", "").(string))
	a := utils.GetQuery(r, "a", "").(string)

	//---------------------------------
	layout := "2006-01-02"
	f1ToDate, err := time.Parse(layout, f1.(string))
	//f2ToDate, err := time.Parse(layout, f2.(string))
	//f1week := f1ToDate.Add(-168 * time.Hour)
	f2week := f1ToDate.Add(-336 * time.Hour)
	fechaFinal := f2week.Format("2006-01-02")
	if err != nil {
		return httpmessage.Error(err)
	}
	volumen := "Volumen_Acumulado"
	if a != "" {
		volumen = filtros[a]
	}


	q := fmt.Sprintf(`
							SELECT DISTINCT
								RCD.periodo,
								CONCAT(TRIM(RCD.nombre),'  -  ',RCD.Area, ' Ha') as C_Costo,
								NULLIF(CEILING(%v), 0) as valor,
								RCD.Ult_fecha_riego as fecha
							FROM TMRIEGO_CONSUMO_DIARIO RCD
							JOIN TMCENTROCOSTO CC ON CC.idempresa = RCD.idempresa
							WHERE CC.idempresa = %v
							AND RCD.Periodo = %v
							AND IIF(RCD.id IS NOT NULL,RCD.Ult_fecha_riego, '%v') BETWEEN '%v' AND '%v'
							order BY RCD.Ult_fecha_riego
							FOR JSON PATH`, volumen, user.CompanyId, id, fechaFinal, fechaFinal, f2)
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
	var dataset []dataChartIrrigation

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
		ok, inx := validateDataSetIrrigation(dataset, e)
		if ok {
			dataset[inx].Value = append(dataset[inx].Value, i.Value)
		} else {
			dataset = append(dataset, dataChartIrrigation{
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

	var df = fechaGraphicIrrigation{
		Fecha:   fechas,
		Dataset: dataset,
	}

	return httpmessage.Send(df)
}
