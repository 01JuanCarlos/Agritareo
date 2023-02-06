package agritareo

import (
	"fmt"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/controllers/agritareo/entity/binnacle"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"time"
)

type physotanitaryDetailRoute struct {
	AreaTotal         interface{} `json:"area_total"`
	CodigoSubConcepto interface{} `json:"codigo_subconcepto_agricola"`
	Color             interface{} `json:"color"`
	Concepto          string      `json:"concepto_agricola"`
	Concept           string      `json:"concepto"`
	Cultivate         interface{} `json:"cultivo"`
	Fecha             string      `json:"fecha"`
	Evaluator         interface{} `json:"evaluador"`
	Glosa             interface{} `json:"glosa"`
	Id                interface{} `json:"id"`
	IdBitacora        interface{} `json:"idbitacora_agricola_sanitaria"`
	IdCentroCosto     interface{} `json:"idcentro_costo"`
	IdConcepto        int         `json:"idconcepto_agricola"`
	IdCultivo         interface{} `json:"idcultivo"`
	IdVariedad        interface{} `json:"idcultivo_variedad"`
	IdSubConcepto     interface{} `json:"idsubconcepto_agricola"`
	IdTipoConcepto    interface{} `json:"idtipo_concepto"`
	IdUmbral          interface{} `json:"idumbral_rango"`
	Image             interface{} `json:"imagenes"`
	NombreNivel       interface{} `json:"nombrenivel"`
	NumeroNivel       interface{} `json:"numero_nivel"`
	SubConcepto       string      `json:"subconcepto_agricola"`
	TipoConcepto      interface{} `json:"tipo_concepto"`
	Umbral            interface{} `json:"umbral_rango"`
	ValorEncontrado   string      `json:"valor_encontrado"`
	Variedad          interface{} `json:"variedad"`
}


const (
	spBinnacleRouteReport       = "REPORTE_RUTA_FITOSANIDAD"
	spBinnacleDetailRouteReport = "REPORTE_BITACORA_RUTA_DETALLE"
)

func GetPhytosanitaryRouteReport(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//var f1, f2 interface{}
	var pd binnacle.RouteDates
	pd.Fecha = utils.GetQuery(r, "i", "").(string)
	//pd.FechaInicio = utils.GetQuery(r, "i", "").(string)
	//pd.FechaFin = utils.GetQuery(r, "f", "").(string)
	if pd.Fecha != "" {
		err := pd.Validate()
		if err != nil {
			return httpmessage.Error(err)
		}
	} else {
		fechanow := time.Now()
		// utilizar este por si quiero hacer de un año atras
		//fechalast := fechanow.AddDate(0,0,0)
		//pd.FechaFin = fmt.Sprintf(`%v/%v/%v`, fechanow.Year(), int(fechanow.Month()), fechanow.Day())
		pd.Fecha = fmt.Sprintf(`%v/%v/%v`, fechanow.Year(), int(fechanow.Month()), fechanow.Day())
	}
	result, err := user.Sql.ExecJson(spBinnacleRouteReport+constants.DetailSuffix,
		user.CompanyId,
		user.UserId,
		pd.Fecha)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func GetPhytosanitaryDetailRouteReport(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var pd binnacle.RouteDates
	pd.Fecha = utils.GetQuery(r, "i", "").(string)

	id := utils.GetIntVar(r, "id")
	//var body []physotanitaryDetailRoute
	// inputs
	if pd.Fecha != "" {
		err := pd.Validate()
		if err != nil {
			return httpmessage.Error(err)
		}
	} else {
		fechanow := time.Now()
		// utilizar este por si quiero hacer de un año atras
		//fechalast := fechanow.AddDate(0,0,0)
		//pd.FechaFin = fmt.Sprintf(`%v/%v/%v`, fechanow.Year(), int(fechanow.Month()), fechanow.Day())
		pd.Fecha = fmt.Sprintf(`%v/%v/%v`, fechanow.Year(), int(fechanow.Month()), fechanow.Day())
	}
	result, err := user.Sql.ExecJson(spBinnacleDetailRouteReport+constants.DetailSuffix,
		user.CompanyId,
		user.UserId,
		pd.Fecha,
		id)
	if err != nil {
		return httpmessage.Error(err)
	}
	//err = json.Unmarshal([]byte(result), &body)
	//if err != nil {
	//	return httpmessage.Error(err)
	//}
	//fmt.Println(result)
	return httpmessage.Json(result)
}
