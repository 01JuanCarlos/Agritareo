package agritareo

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"strings"
	"time"
)

type actividadBodyReport struct {
	Id   *int    `db:"IdActividad" json:"IdActividad,omitempty"`
	Name *string `db:"Actividad" json:"Actividad"`
}

type maquinistaBodyReport struct {
	Id   *int    `db:"IdMaquinista" json:"IdMaquinista,omitempty"`
	Name *string `db:"Maquinista" json:"Maquinista"`
}

type maquinaBodyReport struct {
	Id   *int    `db:"idcentrocosto" json:"idcentrocosto,omitempty"`
	Name *string `db:"Maquina" json:"Maquina"`
}

const (
	spMachinery        = "BITACORA_MAQUINARIA"
	spGraficoMachinery = "GRAFICO_MAQUINARIA"
)

// MAQUINARIA

func GetActividad(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var cul []actividadBodyReport
	err := user.Sql.Select(&cul, `SELECT DISTINCT IdActividad, Actividad from TMMAQUINARIA`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(cul)
}

func GetMaquinista(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var cul []maquinistaBodyReport
	err := user.Sql.Select(&cul, `SELECT DISTINCT IdMaquinista, Maquinista from TMMAQUINARIA`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(cul)
}

func GetTableMaquinaria(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	p := utils.GetQuery(r, "page", "")
	i := utils.GetQuery(r, "items", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	lote := utils.GetQuery(r, "lote", "")
	act := utils.GetQuery(r, "act", "")
	maq := utils.GetQuery(r, "maq", "")

	//fi := utils.GetQuery(r, "fi", "")
	//ff := utils.GetQuery(r, "ff", "")

	result, err := user.Sql.Page(
		fmt.Sprintf(`%v`, spMachinery+constants.ListSuffix),
		user.CompanyId,
		i,
		p,
		s,
		o,
		lote,
		act,
		maq,
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

//MAQUINARIA GRAFICO

func GetMaquina(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var cul []maquinaBodyReport
	err := user.Sql.Select(&cul, `select DISTINCT
	    MA.idcentrocosto,
		MA.lote as Maquina
	FROM TMMAQUINARIA_GRAFICO MA`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(cul)
}

type dataChartMaquinaria struct {
	Name  string    `json:"label"`
	Value []float64 `json:"data"`
	Color string    `json:"backgroundColor"`
}

type fechaGraphicMaquinaria struct {
	Fecha   []string         `json:"labels"`
	Dataset []dataChartMaquinaria `json:"dataset"`
}

//asdasdas
func validateDataSetMaquinaria(d []dataChartMaquinaria, i string) (res bool, inx int) {
	for k, x := range d {
		if x.Name == i {
			return !res, k
		}
	}
	return
}


type loteGraficoMaquinariaDetail struct {
	Name          string      `json:"Centro_Costo"`
	Fecha         string      `json:"fecha"`
	IdCentroCosto interface{} `json:"idcentrocosto"`
	Value         float64     `json:"valor"`
}

func GetMaquinariaDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body []loteGraficoMaquinariaDetail
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
	result, err := user.Sql.ExecJson(spGraficoMachinery+constants.DetailSuffix,
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
	var dataset []dataChartMaquinaria

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
		ok, inx := validateDataSetMaquinaria(dataset, e)
		if ok {
			dataset[inx].Value = append(dataset[inx].Value, i.Value)
		} else {
			dataset = append(dataset, dataChartMaquinaria{
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

	var df = fechaGraphicMaquinaria{
		Fecha:   fechas,
		Dataset: dataset,
	}

	return httpmessage.Send(df)
}
