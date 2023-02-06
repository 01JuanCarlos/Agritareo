package agritareo

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"regexp"
	"strings"
	"time"
)

func GetApi(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	re := regexp.MustCompile("(consulta)(.*)")
	match := re.FindStringSubmatch(fmt.Sprintf("%v", r.URL))
	query := fmt.Sprintf(`http://68.168.108.152:3000/api/%v`, match[0])
	response, err := http.Get(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	data, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(string(data))
}

func stringDate(fecha string) string {
	firstDay := strings.Split(fecha, "/")
	return fmt.Sprintf(`%v%v%v`, firstDay[2], firstDay[1], firstDay[0])
}

type centroMaquinaria struct {
	Centro string `json:"centro_costos"`
	Maqui  string `json:"maquinarias"`
}

type subcentro struct {
	//	Id             int         `json:"id"`
	Idconsumidor string      `json:"idconsumidor"`
	Lote         string      `json:"lote"`
	Total_horas  interface{} `json:"total_horas"`
	Horas_ha     interface{} `json:"horas_ha"`
	// Coordenadas    interface{} `json:"coordenadas"`
	Maquinarias_cc interface{} `json:"maquinarias_cc"`
	//	Idpadre        interface{} `json:"idpadre"`
}

type ccoor struct {
	Id             int         `json:"id"`
	Nombre         string      `json:"nombre"`
	Codigo         string      `json:"codigo"`
	Idsiembra      interface{} `json:"idsiembra"`
	Coordenadas    interface{} `json:"coordenadas"`
	Idpadre        interface{} `json:"idpadre"`
	Lote           string      `json:"lote"`
	Total_horas    interface{} `json:"total_horas"`
	Horas_ha       interface{} `json:"horas_ha"`
	Maquinarias_cc interface{} `json:"maquinarias_cc"`
	Variedades     interface{} `json:"variedades"`
}

type fitosanidadBody struct {
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

type loteCosechaBody struct {
	Id   *int    `db:"id" json:"id"`
	Name *string `db:"nombrenivel" json:"nombrenivel"`
}

type loteRiegoBody struct {
	Id   *int    `db:"id" json:"id"`
	Name *string `db:"nombrenivel" json:"nombrenivel"`
}

type loteAguaBody struct {
	Year        *int    `db:"anio_campania" json:"anio_campania"`
	Description *string `db:"descripcion" json:"descripcion"`
}

const (
	spReport         = "REPORTE"
	spHarvest        = "BITACORA_COSECHA"
	spLoteHarvest    = "LOTE_COSECHA"
	spLabor          = "BITACORA_MANO_DE_OBRA"
)

func GetMachinery(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	f1 := utils.GetQuery(r, "i", "").(string)
	f2 := utils.GetQuery(r, "f", "").(string)
	emp := "001"
	query := fmt.Sprintf(`AGRIREPORTE_MAQUINARIAS_INICIAL_XML @idempresa = '%v'`, emp)
	var fd1, fd2 string
	if f1 != "" {
		fd1 = stringDate(f1)
		query = fmt.Sprintf(`%v, @cdesde='%v'`, query, fd1)
	}
	if f2 != "" {
		fd2 = stringDate(f2)
		query = fmt.Sprintf(`%v, @chasta='%v'`, query, fd2)
	}

	result, err := user.Sql.ExecJson(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

type details struct {
	DetalleMaquinarias string `json:"detalles_maquinarias"`
	Horas_maquinaria   string `json:"horas_maquinaria"`
	Horas_totales      string `json:"horas_totales"`
}

func DetailMachinery(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	f1 := utils.GetQuery(r, "i", "").(string)
	f2 := utils.GetQuery(r, "f", "").(string)
	emp := "001"
	query := fmt.Sprintf(`AGRIREPORTE_MAQUINARIAS_DETALLE_XML @idempresa = '%v'`, emp)
	var fd1, fd2 string
	if f1 != "" {
		fd1 = stringDate(f1)
		query = fmt.Sprintf(`%v, @cdesde='%v'`, query, fd1)
	}
	if f2 != "" {
		fd2 = stringDate(f2)
		query = fmt.Sprintf(`%v, @chasta='%v'`, query, fd2)
	}
	query = fmt.Sprintf(`%v, @ccosto='%v'`, query, id)
	result, err := user.Sql.ExecJson(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func GetFertilization(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	f1 := utils.GetQuery(r, "i", "").(string)
	f2 := utils.GetQuery(r, "f", "").(string)
	emp := "001"
	query := fmt.Sprintf(`AGRIREPORTE_FERTILIZACION_INICIAL_XML @idempresa = '%v'`, emp)
	var fd1, fd2 string
	if f1 != "" {
		fd1 = stringDate(f1)
		query = fmt.Sprintf(`%v, @cdesde='%v'`, query, fd1)
	}
	if f2 != "" {
		fd2 = stringDate(f2)
		query = fmt.Sprintf(`%v, @chasta='%v'`, query, fd2)
	}
	result, err := user.Sql.ExecJson(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func DetailFito(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	f1 := utils.GetQuery(r, "i", "").(string)
	f2 := utils.GetQuery(r, "f", "").(string)
	mo := utils.GetQuery(r, "m", "").(string)
	emp := "001"
	query := fmt.Sprintf(`AGRIREPORTE_FERTILIZACION_DETALLE_XML @idempresa = '%v'`, emp)
	var fd1, fd2 string
	if f1 != "" {
		fd1 = stringDate(f1)
		query = fmt.Sprintf(`%v, @cdesde='%v'`, query, fd1)
	}
	if f2 != "" {
		fd2 = stringDate(f2)
		query = fmt.Sprintf(`%v, @chasta='%v'`, query, fd2)
	}
	if mo != "" {
		query = fmt.Sprintf(`%v, @modulo='%v'`, query, mo)
	}

	query = fmt.Sprintf(`%v, @ccosto='%v'`, query, id)
	result, err := user.Sql.ExecJson(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

// ..........................RIEGGO

type riegoInicial struct {
	Idconsumidor    string
	Desc_consumidor interface{}
	Volumen         interface{}
	Volumen_Ha      interface{}
}
type coorRiego struct {
	Id              int         `json:"id"`
	Nombre          string      `json:"nombre"`
	Codigo          string      `json:"codigo"`
	Idsiembra       interface{} `json:"idsiembra"`
	Coordenadas     interface{} `json:"coordenadas"`
	Idpadre         interface{} `json:"idpadre"`
	Variedades      interface{} `json:"variedades"`
	Desc_consumidor interface{} `json:"desc_consumidor"`
	Volumen         interface{} `json:"volumen"`
	Volumen_Ha      interface{} `json:"volumen_ha"`
}

type dates struct {
	F1 sql.NullString
	F2 sql.NullString
}

type loteCosechaBodyDetail struct {
	Name          string      `json:"nombre"`
	Fecha         string      `json:"fecha"`
	IdCentroCosto interface{} `json:"idcentrocosto"`
	Value         float64     `json:"valor"`
	Unit          string      `json:"unidad_medida"`
}


type loteLaborBodyDetail struct {
	Name          string      `json:"desactividad"`
	Fecha         string      `json:"fecha"`
	IdCentroCosto interface{} `json:"id"`
	Value         float64     `json:"jornales"`
}

func Irrigation(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	f1 := utils.GetQuery(r, "i", "").(string)
	f2 := utils.GetQuery(r, "f", "").(string)

	emp := "001"
	query := fmt.Sprintf(`AGRIREPORTE_RIEGO_INICIAL_XML '%v'`, emp)
	var fd1, fd2 string
	if f1 != "" {
		fd1 = stringDate(f1)
		query = query + "," + fd1
	}
	if f2 != "" {
		fd2 = stringDate(f2)
		query = query + "," + fd2
	}

	result, err := user.Sql.ExecJson(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	fmt.Println(result)
	return httpmessage.Json(result)
}

func DetailIrrigation(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	emp := "001"
	query := fmt.Sprintf(`AGRIREPORTE_RIEGO_DETALLE_XML @idempresa = '%v'`, emp)
	//params.Add("idempresa", emp)
	f1 := utils.GetQuery(r, "i", "").(string)
	f2 := utils.GetQuery(r, "f", "").(string)
	var fd1, fd2 string
	if f1 != "" {
		fd1 = stringDate(f1)
		//params.Add("cdesde", fd1)
		query = fmt.Sprintf(`%v, @cdesde='%v'`, query, fd1)
	}
	if f2 != "" {
		fd2 = stringDate(f2)
		query = fmt.Sprintf(`%v, @chasta='%v'`, query, fd2)
	}
	query = fmt.Sprintf(`%v, @ccosto='%v'`, query, id)
	result, err := user.Sql.ExecJson(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	if result != "" {
		return httpmessage.Json(result)
	}
	return httpmessage.Send([]string{})
}

func DetailLabor(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	emp := "001"
	query := fmt.Sprintf(`AGRIREPORTE_MANOOBRA_DETALLE_XML  @idempresa = '%v'`, emp)
	f1 := utils.GetQuery(r, "i", "").(string)
	f2 := utils.GetQuery(r, "f", "").(string)
	var fd1, fd2 string
	if f1 != "" {
		fd1 = stringDate(f1)
		query = fmt.Sprintf(`%v, @cdesde='%v'`, query, fd1)
	}
	if f2 != "" {
		fd2 = stringDate(f2)
		query = fmt.Sprintf(`%v, @chasta='%v'`, query, fd2)
	}
	query = fmt.Sprintf(`%v, @ccosto='%v'`, query, id)
	result, err := user.Sql.ExecJson(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	if result != "" {
		return httpmessage.Json(result)
	}
	return httpmessage.Send([]string{})
}

// EXEC NS_AGRIREPORTE_HORAS_COSTOMNOBRA_DETALLE @idempresa = '001', @cdesde = '20180101', @chasta = '20191231', @ccosto = 'ACOM001'

func DetailLaborCost(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	emp := "001"
	query := fmt.Sprintf(`AGRIREPORTE_HORAS_COSTOMNOBRA_DETALLE_XML  @idempresa = '%v'`, emp)
	f1 := utils.GetQuery(r, "i", "").(string)
	f2 := utils.GetQuery(r, "f", "").(string)
	var fd1, fd2 string
	if f1 != "" {
		fd1 = stringDate(f1)
		query = fmt.Sprintf(`%v, @cdesde='%v'`, query, fd1)
	}
	if f2 != "" {
		fd2 = stringDate(f2)
		query = fmt.Sprintf(`%v, @chasta='%v'`, query, fd2)
	}
	query = fmt.Sprintf(`%v, @ccosto='%v'`, query, id)
	result, err := user.Sql.ExecJson(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	if result != "" {
		return httpmessage.Json(result)
	}
	return httpmessage.Send([]string{})
}

func GetPhytosanitary(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var companyLevel []fitosanidadBody
	err := user.Sql.SelectProcedure(&companyLevel, constants.ReporteFitosanidad, user.CompanyId)
	//result, err := user.Sql.ExecJson(constants.PListCompanyLevels, user.CompanyId)
	if nil != err {
		return httpmessage.Error(err)
	}
	for i, j := range companyLevel {
		if j.Coordenadas != nil {
			companyLevel[i].Coordenadas = json.RawMessage(j.Coordenadas.(string))
		}
	}
	return httpmessage.Send(companyLevel)
}

func Labor(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	f1 := utils.GetQuery(r, "i", "").(string)
	f2 := utils.GetQuery(r, "f", "").(string)

	emp := "001"
	query := fmt.Sprintf(`AGRIREPORTE_MANOOBRA_INITIAL_XML '%v'`, emp)
	var fd1, fd2 string
	if f1 != "" {
		fd1 = stringDate(f1)
		query = query + "," + fd1
	}
	if f2 != "" {
		fd2 = stringDate(f2)
		query = query + "," + fd2
	}

	result, err := user.Sql.ExecJson(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func GetReport(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	i := utils.GetQuery(r, "items", "")
	p := utils.GetQuery(r, "page", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	result, err := user.Sql.Page(spReport+constants.ListSuffix,
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

func GetGraphicTableIrrigation(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	f1 := utils.GetQuery(r, "i", "").(string)
	f2 := utils.GetQuery(r, "f", "").(string)
	//id := utils.GetQuery(r, "id", "").(string)
	//
	//intVar, err := strconv.Atoi(id)
	//if err != nil {
	//	return httpmessage.Error(err)
	//}
	if f1 == "" {
		current := time.Now()
		f1 = fmt.Sprintf(`%v%v%v`, current.Year(), int(current.Month()), 1)
		f2 = fmt.Sprintf(`%v%v%v`, current.Year(), int(current.Month()), current.Day())
	}
	//fmt.Println(f1, f2)
	q := fmt.Sprintf("http://199.241.218.184:3000/api/consulta/ns_variable_riego_campo/?variable_id=2&fecha_ini=%v&fecha_fin=%v", f1, f2)
	//emp := "001"
	resp, err := http.Get(q)
	//fmt.Println(f1, f2, q)

	if err != nil {
		return httpmessage.Error(err)
	}
	//query := fmt.Sprintf(`AGRIREPORTE_RIEGO_INICIAL_XML '%v'`, emp)
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return httpmessage.Error(err)
	}
	//Convert the body to type string
	sb := string(body)
	//log.Printf(sb)

	return httpmessage.Json(sb)
}

type manoObraBody struct {
	Id   *int    `db:"id" json:"id"`
	Name *string `db:"nombrenivel" json:"nombrenivel"`
}

func GetManoObra(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var zona []manoObraBody
	err := user.Sql.Select(&zona, `select distinct CC.id ,CC.nombrenivel  
	from tmcentrocosto CC
	LEFT JOIN TMMANO_DE_OBRA_JORNAL R ON R.id = CC.id
	where CC.id = R.id`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(zona)
}

type empresaBody struct {
	Id   *int    `db:"id" json:"id"`
	Name *string `db:"nombre" json:"nombre"`
}


func GetEmpresa(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var zona []empresaBody
	err := user.Sql.Select(&zona, `select id, nombre from TMEMPRESA`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(zona)
}

func GetLoteCosecha(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var lote []loteCosechaBody
	err := user.Sql.SelectProcedure(&lote, spLoteHarvest+constants.ListSuffix, user.CompanyId)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(lote)
}

func GetTableHarvest(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	p := utils.GetQuery(r, "page", "")
	i := utils.GetQuery(r, "items", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	lote := utils.GetQuery(r, "lote", "")

	//fi := utils.GetQuery(r, "fi", "")
	//ff := utils.GetQuery(r, "ff", "")

	//resp, err := http.Get("http://199.241.218.184:3000/api/consulta/ns_variable_riego_campo/?variable_id=1&fecha_ini=20210201&fecha_fin=20221231")
	//if nil != err {
	//	return httpmessage.Error(err)
	//}
	//
	//body, err := ioutil.ReadAll(resp.Body)
	//
	//if err != nil {
	//	log.Fatalln(err)
	//}
	//
	//sb := string(body)
	//log.Printf(sb)



	result, err := user.Sql.Page(
		fmt.Sprintf(`%v`, spHarvest+constants.ListSuffix),
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

func GetTableHarvestDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body []loteCosechaBodyDetail
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
	result, err := user.Sql.ExecJson(spHarvest+constants.DetailSuffix,
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



func GetMultiHarvestDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	ids := utils.GetVar(r, "ids")
	var body []loteCosechaBodyDetail
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
								CO.idcentrocosto,
								CONCAT(TRIM(nombre),'  -  ', area, ' Ha')as nombre,
								CEILING(CO.valor) as valor,
								CO.fecha,
								CO.unidad_medida
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

//

type fechaGraphicLabor struct {
	Fecha   []string         `json:"labels"`
	Dataset []dataChartLabor `json:"dataset"`
}

type dataChartLabor struct {
	Name  string    `json:"label"`
	Value []float64 `json:"data"`
	Color string    `json:"backgroundColor"`
}

func validateDataSetLabor(d []dataChartLabor, i string) (res bool, inx int) {
	for k, x := range d {
		if x.Name == i {
			return !res, k
		}
	}
	return
}

// MANO DE OBRA
func GetTableLabor(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	p := utils.GetQuery(r, "page", "")
	i := utils.GetQuery(r, "items", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	lote := utils.GetQuery(r, "lote", "")
	labor := utils.GetQuery(r, "labor", "")

	//fi := utils.GetQuery(r, "fi", "")
	//ff := utils.GetQuery(r, "ff", "")

	result, err := user.Sql.Page(
		fmt.Sprintf(`%v`, spLabor+constants.ListSuffix),
		user.CompanyId,
		i,
		p,
		s,
		o,
		lote,
		labor,
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

func GetTableLaborDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body []loteLaborBodyDetail
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
	result, err := user.Sql.ExecJson(spLabor+constants.DetailSuffix,
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
	var dataset []dataChartLabor

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
		ok, inx := validateDataSetLabor(dataset, e)
		if ok {
			dataset[inx].Value = append(dataset[inx].Value, i.Value)
		} else {
			dataset = append(dataset, dataChartLabor{
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

	var df = fechaGraphicLabor{
		Fecha:   fechas,
		Dataset: dataset,
	}

	return httpmessage.Send(df)
}

func GetLaborMultiDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//ids := utils.Get(r, "ids", "").(string)
	ids := utils.GetVar(r, "ids")
	var body []loteLaborBodyDetail
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
								CONCAT(RI.desactividad,' - ', RI.desclabor) as desactividad,
								RI.jornales,
								RI.fecha
							FROM TMMANO_DE_OBRA_JORNAL RI
							JOIN TMCENTROCOSTO CC ON CC.idempresa = RI.idempresa
							WHERE CC.idempresa = %v
							AND RI.id in (%v)
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
	var dataset []dataChartLabor

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
		ok, inx := validateDataSetLabor(dataset, e)
		if ok {
			dataset[inx].Value = append(dataset[inx].Value, i.Value)
		} else {
			dataset = append(dataset, dataChartLabor{
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

	var df = fechaGraphicLabor{
		Fecha:   fechas,
		Dataset: dataset,
	}

	return httpmessage.Send(df)
}


func validateFechaa(fechas []string, i string) (res bool) {
	for _, x := range fechas {
		if x == i {
			return !res
		}
	}
	return
}

func validateDataSett(d []dataChart, i string) (res bool, inx int) {
	for k, x := range d {
		if x.Name == i {
			return !res, k
		}
	}
	return
}
