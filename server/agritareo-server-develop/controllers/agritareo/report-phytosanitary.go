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
	"time"
)

type zonaBody struct {
	Id              *int        `db:"id" json:"id,omitempty"`
	Codigo          interface{} `db:"codigo" json:"codigo"`
	Descripcion     *string     `db:"descripcion" json:"descripcion"`
	DescipcionCorta interface{} `db:"descripcion_corta" json:"descripcion_corta"`
}

type AguaTotalBody struct {
	AreaTotal             interface{} `db:"Areatotal" json:"Areatotal"`
	HourTotal             interface{} `db:"Horas_Riego_AcumuladasTotal" json:"Horas_Riego_AcumuladasTotal"`
	VolumenTotal          interface{} `db:"Volumen_AcumuladoTotal" json:"Volumen_AcumuladoTotal"`
	HourAcumuladaTotal    interface{} `db:"Horas_Riego_Acumuladas_HaTotal" json:"Horas_Riego_Acumuladas_HaTotal"`
	VolumenAcumuladoTotal interface{} `db:"Volumen_Acumulado_HaTotal" json:"Volumen_Acumulado_HaTotal"`
	NumberDays            interface{} `db:"Nro_dias_riegoTotal" json:"Nro_dias_riegoTotal"`
	Periodo               interface{} `db:"Periodo" json:"Periodo"`
}

type conceptBody struct {
	Id     *int        `db:"idconcepto" json:"idconcepto,omitempty"`
	Codigo interface{} `db:"codigo" json:"codigo"`
	Name   *string     `db:"nombre" json:"nombre"`
}

type cultivoBodyReport struct {
	Id   *int    `db:"id" json:"id,omitempty"`
	Name *string `db:"nombre" json:"nombre"`
}

type laborBodyReport struct {
	Id   *string `db:"idlabor" json:"idlabor,omitempty"`
	Name *string `db:"desclabor" json:"desclabor"`
}

type organoBody struct {
	Id   *int    `db:"idevaluacion_subconcepto" json:"idevaluacion_subconcepto,omitempty"`
	Name *string `db:"organo_afectado" json:"organo_afectado"`
}

type loteBody struct {
	Id   *int    `db:"idcentro_costo" json:"idcentro_costo,omitempty"`
	Name *string `db:"nombrenivel" json:"nombrenivel"`
}

type sectorBody struct {
	Id   *int    `db:"id" json:"id,omitempty"`
	Name *string `db:"nombrenivel" json:"nombrenivel"`
	Code *string `db:"codigo" json:"codigo"`
}

type physotanitaryGraphicDetail struct {
	Concepto        string      `json:"concepto"`
	Fecha           string      `json:"fecha"`
	Id              interface{} `json:"id"`
	IdCentroCosto   interface{} `json:"idcentro_costo"`
	ValorEncontrado string      `json:"valor_encontrado"`
}

type fechaGraphicFitosanidad struct {
	Fecha   []string    `json:"labels"`
	Dataset []dataChart `json:"dataset"`
}

type dataChart struct {
	Name  string    `json:"label"`
	Value []float64 `json:"data"`
	Color string    `json:"borderColor"`
}

//sss
type imagenBody struct {
	Id                            *int        `db:"id" json:"id,omitempty"`
	UuidImage                     interface{} `db:"imagen_uuid" json:"imagen_uuid"`
	Organo                        string      `db:"organo_afectado" json:"organo_afectado"`
	Note                          string      `db:"nota" json:"nota"`
	Idbitacora_agricola           *int        `db:"idbitacora_agricola" json:"idbitacora_agricola"`
	Idbitacora_agricola_sanitaria *int        `db:"idbitacora_agricola_sanitaria" json:"idbitacora_agricola_sanitaria"`
	Idbitacora_agricola_evidencia *int        `db:"idbitacora_agricola_evidencia" json:"idbitacora_agricola_evidencia"`
	Rute                          interface{} `db:"ruta" json:"ruta"`
}

var hex = []string{
	"#2F86A6",
	"#34BE82",
	"#3E2723",
	"#F1C40F",
	"#A93226",
	"#1B2631",
	"#311B92",
	"#004D40",
}

const (
	spGraphicTablePhytosanitaryDetail = "GRAFICO_TABLA_FITOSANIDAD"
	spGraphicTablePhytosanitary       = "GRAFICO_TABLA_FITOSANIDAD"
	spImageDetail                     = "BITACORA_IMAGE"
)

// Get Zona
func GetZona(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var zona []zonaBody
	err := user.Sql.Select(&zona, `select id ,codigo, descripcion, descripcion_corta from TMZONA_GEOGRAFICA`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(zona)
}

// Get Concepto
func GetConcept(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var concept []conceptBody
	err := user.Sql.Select(&concept, `select DISTINCT idconcepto , CA.codigo, CA.nombre FROM TRBITACORA_AGRICOLA_SANITARIA BAS
											JOIN TMCONCEPTO_AGRICOLA CA ON CA.id = BAS.idconcepto`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(concept)
}

// Get Cultivo
func GetCultivo(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var cul []cultivoBodyReport
	err := user.Sql.Select(&cul, `SELECT id, nombre from TMCULTIVO`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(cul)
}

func GetLabor(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var lab []laborBodyReport
	err := user.Sql.Select(&lab, `select distinct desclabor,idlabor from tmmano_obra_Detalle`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(lab)
}

// Get Organo afectado
func GetOrgano(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var o []organoBody
	err := user.Sql.Select(&o, `select DISTINCT BAS.idevaluacion_subconcepto,ESCA.organo_afectado FROM TRBITACORA_AGRICOLA_SANITARIA BAS
										JOIN TMEVALUACION_SUBCONCEPTO_CULTIVO ESCA ON ESCA.id = BAS.idevaluacion_subconcepto`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(o)
}

// Get Lotes
func GetLote(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var lote []loteBody
	err := user.Sql.Select(&lote, `select DISTINCT BA.idcentro_costo, CC.nombrenivel from trbitacora_Agricola BA
										JOIN TMCENTROCOSTO CC ON CC.id = BA.idcentro_costo`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(lote)
}

func GetSector(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var lote []sectorBody
	err := user.Sql.Select(&lote, `select id , nombrenivel, codigo from TMCENTROCOSTO where idnivelconfiguracion = 12`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(lote)
}

// GRAFICO/TABLA FITOSANIDAD
func GetGraphicTablePhytosanitary(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	p := utils.GetQuery(r, "page", "")
	i := utils.GetQuery(r, "items", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	r1 := utils.GetQuery(r, "r", "")
	e := utils.GetQuery(r, "e", "")
	co := utils.GetQuery(r, "co", "")
	cul := utils.GetQuery(r, "cul", "")
	org := utils.GetQuery(r, "org", "")
	lote := utils.GetQuery(r, "lote", "")
	//fi := utils.GetQuery(r, "fi", "")
	//ff := utils.GetQuery(r, "ff", "")

	result, err := user.Sql.Page(
		fmt.Sprintf(`%v`, spGraphicTablePhytosanitary+constants.ListSuffix),
		user.CompanyId,
		i,
		p,
		s,
		o,
		r1,
		e,
		co,
		cul,
		org,
		lote,
		//fi,
		//ff,
	)
	if nil != err {
		return httpmessage.Error(err)
	}

	data := result.Data.([]map[string]interface{})
	for _, i := range data {
		i["area_total"], _ = (strconv.ParseFloat(string(i["area_total"].([]uint8)), 64))
		i["area_sembrada"], _ = (strconv.ParseFloat(string(i["area_sembrada"].([]uint8)), 64))
	}
	return httpmessage.Page(
		result.Data,
		result.TotalFiltered,
		result.TotalRows,
	)
}

func validateFecha(fechas []string, i string) (res bool) {
	for _, x := range fechas {
		if x == i {
			return !res
		}
	}
	return
}

func validateDataSet(d []dataChart, i string) (res bool, inx int) {
	for k, x := range d {
		if x.Name == i {
			return !res, k
		}
	}
	return
}

func GetImageBinnacle(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//id := utils.GetIntVar(r, "id")
	var img []imagenBody
	err := user.Sql.Select(&img, `SELECT
					BA.idcentro_costo,
					CC.nombrenivel,
					CAC.nombre AS 'concepto',
					BAS.organo_afectado,
					BAs.glosa as 'nota',
					BA.id as 'idbitacora_agricola',
					BAS.id as 'idbitacora_agricola_sanitaria',
					BSE.id as 'idbitacora_agricola_evidencia',
					BSE.ruta
					FROM TRBITACORA_AGRICOLA BA
					LEFT JOIN TRBITACORA_AGRICOLA_SANITARIA BAS ON BAS.idbitacora_agricola = BA.id
					LEFT JOIN TRBITACORA_SANITARIAS_EVIDENCIAS BSE on BSE.idbitacora_agricola_sanitaria = BAS.id
					LEFT JOIN TMCENTROCOSTO CC ON CC.id =  BA.idcentro_costo
					LEFT JOIN TMCONCEPTO_AGRICOLA CAC ON CAC.id = BAS.idconcepto
					where BSE.idbitacora_agricola_sanitaria = BAS.id
					ORDER BY idbitacora_agricola desc `)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(img)
}

func GetImageDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var img []imagenBody
	_ = utils.ParseBody(r, &img)
	err := user.Sql.SelectProcedure(&img, spImageDetail+constants.DetailSuffix, user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(img)
}

func GetGraphicTablePhytosanitaryDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body []physotanitaryGraphicDetail
	// inputs
	var f1, f2 interface{}
	f1 = dateFunc(utils.GetQuery(r, "i", "").(string))
	f2 = dateFunc(utils.GetQuery(r, "f", "").(string))
	//ids = utils.GetQuery(r, "ids", "").(string)

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
	result, err := user.Sql.ExecJson(spGraphicTablePhytosanitaryDetail+constants.DetailSuffix,
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
		s, err := strconv.ParseFloat(i.ValorEncontrado, 64)
		if err != nil {
			return httpmessage.Error(err)
		}
		ok, inx := validateDataSet(dataset, i.Concepto)
		if ok {
			dataset[inx].Value = append(dataset[inx].Value, s)
		} else {
			dataset = append(dataset, dataChart{
				Name:  i.Concepto,
				Value: []float64{s},
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

func GetGraphicTablePhytosanitaryDetailMultiple(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body []physotanitaryGraphicDetail
	// inputs
	ids := utils.GetVar(r, "ids")
	var f1, f2 interface{}
	f1 = dateFunc(utils.GetQuery(r, "i", "").(string))
	f2 = dateFunc(utils.GetQuery(r, "f", "").(string))
	//ids = utils.GetQuery(r, "ids", "").(string)

	//---------------------------------
	layout := "2006-01-02"
	f1ToDate, err := time.Parse(layout, f1.(string))
	//f2ToDate, err := time.Parse(layout, f2.(string))
	//f1week := f1ToDate.Add(-168 * time.Hour)
	f2week := f1ToDate.Add(-336 * time.Hour)
	fechaFinal := f2week.Format("2006-01-02")
	decoId, _ := base64.StdEncoding.DecodeString(ids)
	stringId := string(decoId)
	if err != nil {
		return httpmessage.Error(err)
	}
	q := fmt.Sprintf(`
							SELECT
								distinct
								BA.id,
								CC.id AS 'idcentro_costo',
								CONCAT(CA.nombre,' - ', SBA.nombre) as concepto,
								BA.fecha,
								CAST(BAS.valor_encontrado AS int) as valor_encontrado
							FROM TRBITACORA_AGRICOLA BA
							JOIN TRBITACORA_AGRICOLA_SANITARIA BAS ON BAS.idbitacora_agricola = BA.id
							JOIN TMCENTROCOSTO CC ON CC.id = BA.idcentro_costo
							JOIN TMCULTIVO C ON C.id = BA.idcultivo
							JOIN TMCULTIVO_PREFERENCIAS_EMPRESA CPE ON CPE.id = C.idcultivo_preferencia
							JOIN TMCULTIVO_VARIEDAD CV ON CV.id = BA.idcultivo_variedad
							JOIN TMCULTIVO_VARIEDAD_PREFERENCIAS_EMPRESA CVPE ON CVPE.id = CV.idvariedad_preferencia
							LEFT JOIN TMCONCEPTO_AGRICOLA CA ON CA.id = BAS.idconcepto
							LEFT JOIN TMEVALUACION_SUBCONCEPTO_CULTIVO ESC ON ESC.id = BAS.idevaluacion_subconcepto
							LEFT JOIN TMMETODO_EVALUACION_AGRICOLA MEA ON MEA.id = ESC.idmetodo_evaluacion
							LEFT JOIN TMSUBCONCEPTO_AGRICOLA SBA ON SBA.id = ESC.idsubconcepto_agricola
							WHERE CC.idempresa = %v
							AND BA.idcentro_costo in (%v)
							AND IIF(BA.id IS NOT NULL, BA.fecha, '%v') BETWEEN '%v' AND '%v'
							FOR JSON auto`, user.CompanyId, stringId, fechaFinal, fechaFinal, f2)
	result, err := user.Sql.Query(q)
	if err != nil {
		return httpmessage.Error(err)
	}
	var resultString string
	for result.Next() {
		var key = ""
		err = result.Scan(&key)
		if err != nil {
			return httpmessage.Error(err)
		}
		resultString = resultString + key
	}
	err = json.Unmarshal([]byte(resultString), &body)
	// fmt.Println(resultString)
	if err != nil {
		return httpmessage.Error(err)
	}
	var fechas []string
	var dataset []dataChart
	for _, i := range body {
		s, err := strconv.ParseFloat(i.ValorEncontrado, 64)
		fmt.Println(s)
		if err != nil {
			return httpmessage.Error(err)
		}
		ok, inx := validateDataSet(dataset, i.Concepto)
		if ok {
			dataset[inx].Value = append(dataset[inx].Value, s)
		} else {
			dataset = append(dataset, dataChart{
				Name:  i.Concepto,
				Value: []float64{s},
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
