package agritareo

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/controllers/agritareo/entity/binnacle"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
	"ns-api/modules/log"
	"strconv"
	"strings"
	"time"

	"github.com/nfnt/resize"
	uuid "github.com/nu7hatch/gouuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/gridfs"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type binnacleBody struct {
	Id                        interface{} `db:"id" json:"id,omitempty"`
	AreaSembrada              float32     `db:"area_sembrada" json:"area_sembrada"`
	AreaTotal                 float32     `db:"area_total" json:"area_total"`
	IdtipoRegistro            interface{} `db:"idtipo_registro" json:"idtipo_registro"`
	TipoRegistro              interface{} `db:"tipo_registro" json:"tipo_registro"`
	IdEvaluador               interface{} `db:"idevaluador" json:"idevaluador"`
	Evaluador                 interface{} `db:"evaluador" json:"evaluador"`
	FechaCreacion             interface{} `db:"fecha_creacion" json:"fecha_creacion"`
	Fecha                     interface{} `db:"fecha" json:"fecha"`
	IdcentroCosto             interface{} `db:"idcentro_costo" json:"idcentro_costo"`
	Parcela                   interface{} `db:"parcela" json:"parcela"`
	IdSiembra                 interface{} `db:"idsiembra" json:"idsiembra"`
	Idcultivo                 interface{} `db:"idcultivo" json:"idcultivo"`
	Cultivo                   interface{} `db:"cultivo" json:"cultivo"`
	IdCultivoVariedad         interface{} `db:"idcultivo_variedad" json:"idcultivo_variedad"`
	Variedad                  interface{} `db:"variedad" json:"variedad"`
	IdCampaign                interface{} `db:"idcampania" json:"idcampania"`
	IdCampaignAgricola        interface{} `db:"idcampania_agricola" json:"idcampania_agricola"`
	CampaignYear              interface{} `db:"campania_anio" json:"campania_anio"`
	GrowthDay                 interface{} `db:"dia_crecimiento" json:"dia_crecimiento"`
	GrowthWeek                interface{} `db:"semana_crecimiento" json:"semana_crecimiento"`
	IdestadoFenologico        interface{} `db:"idestado_fenologico" json:"idestado_fenologico"`
	IdestadoFenologicoDetalle interface{} `db:"idestado_fenologico_detalle" json:"idestado_fenologico_detalle"`
	IdfenologiaVariedad       interface{} `db:"idfenologia_variedad" json:"idfenologia_variedad"`
	FenologiaVariedad         interface{} `db:"fenologia_variedad" json:"fenologia_variedad"`
	//Area                      interface{} `db:"area" json:"area"`
	//IdtipoConcepto            interface{} `db:"idtipo_concepto" json:"idtipo_concepto"`
	//TipoConcepto              interface{} `db:"tipo_concepto" json:"tipo_concepto"`
	//Idconcepto                interface{} `db:"idconcepto" json:"idconcepto"`
	//Concepto                  interface{} `db:"concepto" json:"concepto"`
	//IdConceptCrop             interface{} `db:"idconcepto_cultivo" json:"idconcepto_cultivo"`
	//IdevaluacionSubconcepto   interface{} `db:"idevaluacion_subconcepto" json:"idevaluacion_subconcepto"`
	//OrganoAfectado            interface{} `db:"organo_afectado" json:"organo_afectado"`
	//IdmetodoEvaluacion        interface{} `db:"idmetodo_evaluacion" json:"idmetodo_evaluacion"`
	//Idmedida                  interface{} `db:"idmedida" json:"idmedida"`
	//Unimedida                 interface{} `db:"unimedida" json:"unimedida"`
	//ValorEncontrado           interface{} `db:"valor_encontrado" json:"valor_encontrado"`
	//Glosa                     interface{} `db:"glosa" json:"glosa"`
	SanitaryEvaluation  interface{} `db:"evaluaciones_sanitarias" json:"evaluaciones_sanitarias"`
	Images              interface{} `db:"imagenes" json:"images"`
	MethodEvaluation    interface{} `db:"metodo_evaluacion" json:"method_evaluation"`
	IDRangeThreshold    interface{} `db:"idumbral_rango" json:"idumbral_rango"`
	LvlNumber           interface{} `db:"numero_nivel" json:"numero_nivel"`
	LvlName             interface{} `db:"nombre_nivel" json:"nombre_nivel"`
	IdPhenologyCampaign interface{} `db:"idfenologia_campania" json:"idfenologia_campania"`
	RangeLvl            interface{} `db:"rango_inicio" json:"rango_inicio"`
	EndRange            interface{} `db:"rango_fin" json:"rango_fin"`
	MetaForm            interface{} `db:"meta_form" json:"meta_form"`
}

type binnacleBodyTable struct {
	Id                        interface{} `db:"id" json:"id,omitempty"`
	IdtipoRegistro            interface{} `db:"idtipo_registro" json:"idtipo_registro"`
	IdEvaluador               interface{} `db:"idevaluador" json:"idevaluador"`
	Evaluador                 interface{} `db:"evaluador" json:"evaluador"`
	Fecha                     interface{} `db:"fecha" json:"fecha"`
	IdcentroCosto             interface{} `db:"idcentro_costo" json:"idcentro_costo"`
	Parcela                   interface{} `db:"parcela" json:"parcela"`
	IdSiembra                 interface{} `db:"idsiembra" json:"idsiembra"`
	Idcultivo                 interface{} `db:"idcultivo" json:"idcultivo"`
	Cultivo                   interface{} `db:"cultivo" json:"cultivo"`
	IdCultivoVariedad         interface{} `db:"idcultivo_variedad" json:"idcultivo_variedad"`
	Variedad                  interface{} `db:"variedad" json:"variedad"`
	CampaignYear              interface{} `db:"campania_anio" json:"campania_anio"`
	DescriptionCampaign       interface{} `db:"descripcion_campania" json:"descripcion_campania"`
	GrowthDay                 interface{} `db:"dia_crecimiento" json:"dia_crecimiento"`
	GrowthWeek                interface{} `db:"semana_crecimiento" json:"semana_crecimiento"`
	IdestadoFenologico        interface{} `db:"idestado_fenologico" json:"idestado_fenologico"`
	IdestadoFenologicoDetalle interface{} `db:"idestado_fenologico_detalle" json:"idestado_fenologico_detalle"`
	IdfenologiaVariedad       interface{} `db:"idfenologia_variedad" json:"idfenologia_variedad"`
	FenologiaVariedad         interface{} `db:"fenologia_variedad" json:"fenologia_variedad"`
	AreaTotal                 float32     `db:"area_total" json:"area_total"`
	AreaSembrada              float32     `db:"area_sembrada" json:"area_sembrada"`
	TipoRegistro              interface{} `db:"tipo_registro" json:"tipo_registro"`
	FechaCreacion             interface{} `db:"fecha_creacion" json:"fecha_creacion"`
	IdCampaign                interface{} `db:"idcampania" json:"idcampania"`
	IdCampaignAgricola        interface{} `db:"idcampania_agricola" json:"idcampania_agricola"`
	IdBitacora                interface{} `db:"idbitacora_agricola_sanitaria" json:"idbitacora_agricola_sanitaria"`
	IdTipoConcepto            interface{} `db:"idtipo_concepto" json:"idtipo_concepto"`
	TipoConcepto              interface{} `db:"tipo_concepto" json:"tipo_concepto"`
	Concepto                  interface{} `db:"concepto_agricola" json:"concepto_agricola"`
	Organ                     interface{} `db:"organo_afectado" json:"organo_afectado"`
	Glosa                     interface{} `db:"glosa" json:"glosa"`
	Route                     interface{} `db:"ruta" json:"ruta"`
	CodeCampaign              interface{} `db:"codigo_campania" json:"codigo_campania"`
	MethodEvaluation          interface{} `db:"metodo_evaluacion" json:"metodo_evaluacion"`
	UniteMedia                interface{} `db:"unidad_medida" json:"unidad_medida"`
	Value                     interface{} `db:"valor_encontrado" json:"valor_encontrado"`
}

type physotanitaryDetail struct {
	AreaTotal         interface{} `json:"area_total"`
	CodigoSubConcepto interface{} `json:"codigo_subconcepto_agricola"`
	Color             interface{} `json:"color"`
	Concepto          string      `json:"concepto_agricola"`
	Concept           string      `json:"concepto"`
	Cultivate         interface{} `json:"cultivo"`
	Fecha             string      `json:"fecha"`
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
	NombreNivel       interface{} `json:"nombre_nivel"`
	NumeroNivel       interface{} `json:"numero_nivel"`
	SubConcepto       string      `json:"subconcepto_agricola"`
	TipoConcepto      interface{} `json:"tipo_concepto"`
	Umbral            interface{} `json:"umbral_rango"`
	ValorEncontrado   string      `json:"valor_encontrado"`
	Variedad          interface{} `json:"variedad"`
}

type physotanitaryDayDetail struct {
	AreaTotal         interface{} `json:"area_total"`
	CodigoSubConcepto interface{} `json:"codigo_subconcepto_agricola"`
	Color             interface{} `json:"color"`
	Concepto          string      `json:"concepto_agricola"`
	Concept           string      `json:"concepto"`
	Cultivate         interface{} `json:"cultivo"`
	Fecha             string      `json:"fecha"`
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
	NombreNivel       interface{} `json:"nombre_nivel"`
	NumeroNivel       interface{} `json:"numero_nivel"`
	SubConcepto       string      `json:"subconcepto_agricola"`
	TipoConcepto      interface{} `json:"tipo_concepto"`
	Umbral            interface{} `json:"umbral_rango"`
	ValorEncontrado   string      `json:"valor_encontrado"`
	Variedad          interface{} `json:"variedad"`
	Evaluator         interface{} `json:"evaluador"`
}

type Concepto struct {
	Nombre string
	Total  int
}

type DataFecha struct {
	Data  interface{}       `json:"data"`
	Table []dataFitosanidad `json:"table"`
}

type DataFitosanidadFecha struct {
	Name string  `json:"concepto"`
	Key  float64 `json:"valorencontrado"`
}

type dataFitosanidad struct {
	Name    string  `json:"concepto"`
	OneWeek float64 `json:"oneweek"`
	TwoWeek float64 `json:"twoweek"`
	Current float64 `json:"current"`
	Value   float64 `json:"value"`
}

type lotes struct {
	LotesDetailEvaluations []evaluaciones `json:"evaluaciones_sanitarias"`
}

type evaluator struct {
	LotesDetail []lotes `json:"lotes"`
}

type evaluaciones struct {
	Evaluator          string `json:"evaluador"`
	ConceptAgriculture string `json:"concepto_agricola"`
	NameLote           string `json:"centrocosto"`
}

type resultados struct {
	Name       string         `json:"nombre"`
	NameLote   string         `json:"name_lote"`
	Plague     []plagueDetail `json:"plaga"`
	ListPlague string         `json:"lista_plaga"`
}

type plagueDetail struct {
	Plague string `json:"plaga"`
	Total  int    `json:"total"`
}

//type detailsBinnacle struct {
//	Id                  interface{} `db:"id" json:"id"`
//	IdCrop              interface{} `db:"idcultivo" json:"idcultivo"`
//	Crop                interface{} `db:"cultivo" json:"cultivo"`
//	IdCropVariety       interface{} `db:"idcultivo_variedad" json:"idcultivo_variedad"`
//	Variety             interface{} `db:"variedad" json:"variedad"`
//	FirstDate           interface{} `db:"fecha_inicio" json:"fecha_inicio"`
//	LastDate            interface{} `db:"fecha_fin" json:"fecha_fin"`
//	IdCampaign          interface{} `db:"idcampania" json:"idcampania"`
//	Code                interface{} `db:"codigo" json:"codigo"`
//	IdCampaignAgricola  interface{} `db:"idcampania_agricola" json:"idcampania_agricola"`
//	Year                interface{} `db:"anio" json:"anio"`
//	Description         interface{} `db:"descripcion" json:"descripcion"`
//	IdPhenologyCampaign interface{} `db:"idfenologia_campania" json:"idfenologia_campania"`
//	IdPhenologyStatus   interface{} `db:"idestado_fenologico" json:"idestado_fenologico"`
//	IdPhenologyDetail   interface{} `db:"idestado_fenologico_d" json:"idestado_fenologico_d"`
//	IdPhenologyVariety  interface{} `db:"idfenologia_variedad" json:"idfenologia_variedad"`
//	PhenologyVariety    interface{} `db:"fenologia_variedad" json:"fenologia_variedad"`
//	TotalArea           interface{} `db:"area_total" json:"area_total"`
//	Area                interface{} `db:"area_sembrada" json:"area_sembrada"`
//	PhenologyDays       interface{} `db:"dias_transcurridos_fenologia" json:"dias_transcurridos_fenologia"`
//	GrowthWeek          interface{} `db:"semana_crecimiento" json:"semana_crecimiento"`
//	GrowthDay           interface{} `db:"dia_crecimiento" json:"dia_crecimiento"`
//	FirstDateSowing     interface{} `db:"fecha_inicio_siembra"  json:"fecha_inicio_siembra"`
//	LastDateSowing      interface{} `db:"fecha_fin_siembra"  json:"fecha_fin_siembra"`
//	FirstDateCampaign   interface{} `db:"fecha_inicio_campania"  json:"fecha_inicio_campania"`
//	LastDateCampaign    interface{} `db:"fecha_fin_campania"  json:"fecha_fin_campania"`
//	FistDatePhenology   interface{} `db:"fecha_inicio_fenologia_campania" json:"fecha_inicio_fenologia_campania"`
//	LastDatePhenology   interface{} `db:"fecha_fin_fenologia_campania" json:"fecha_fin_fenologia_campania"`
//	TotalDays           interface{} `db:"dia_transcurridos_totales" json:"dia_transcurridos_totales"`
//}

const (
	spBinnacleMovil         = "BITACORA_AGRICOLA_SANITARIA_MOVIL"
	spBinnacle              = "BITACORA_AGRICOLA_SANITARIA"
	spTerrainData           = "BITACORA_DATOS_PARCELA"
	spTypeBinnacle          = "TIPO_REGISTRO_BITACORA"
	spBinnacleEvaluation    = "BITACORA_EVALUACION"
	spBinnacleSubConcept    = "BITACORA_SUBCONCEPTO_CULTIVO"
	spBinnacleThreshold     = "BITACORA_UMBRALES_METODO"
	spBinnacleReportDetail  = "REPORTE_BITACORA_FITOSANIDAD_DETALLE"
	spBinnacleDetail        = "REPORTE_BITACORA_FITOSANIDAD_DIA_DETALLE"
	spBinnacleReport        = "REPORTE_BITACORA_FITOSANIDAD"
	spBinnacleReportGraphic = "REPORTE_BITACORA_FITOSANIDAD_GRAFICO"
	spBinnacleTable         = "BITACORA_AGRICOLA_TABLE"
)

func UpdateBinnacleEvaluation(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	result, err := user.Sql.ExecJson(spBinnacleEvaluation+constants.DetailSuffix,
		user.CompanyId,
		id,
		user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func GetBinnacle(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	p := utils.GetQuery(r, "page", "")
	i := utils.GetQuery(r, "items", "")
	s := utils.GetQuery(r, "search", "")
	o := utils.GetQuery(r, "order", "")
	r1 := utils.GetQuery(r, "r", "")
	e := utils.GetQuery(r, "e", "")
	//fi := utils.GetQuery(r, "fi", "")
	//ff := utils.GetQuery(r, "ff", "")

	result, err := user.Sql.Page(
		fmt.Sprintf(`%v`, spBinnacle+constants.ListSuffix),
		user.CompanyId,
		i,
		p,
		s,
		o,
		r1,
		e,
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

func GetBinnacleTable(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var o []binnacleBodyTable
	err := user.Sql.Select(&o,
		`SELECT
		BA.id,
		TRB.id AS 'idtipo_registro',
		TRB.nombre AS 'tipo_registro',
		E.id AS 'idevaluador',
		U.nombre AS 'evaluador',
		BA.fecha,
		CC.id AS 'idcentro_costo',
		CC.nombrenivel AS 'parcela',
		BA.idsiembra,
		C.id AS 'idcultivo',
		C.nombre AS 'cultivo',
		CV.id AS 'idcultivo_variedad',
		CV.nombre AS 'variedad',
		CONCAT_WS(' ', CAM.codigo, '(', FORMAT(CAM.fecha_inicio, 'dd/MM/yyyy'), '-', ISNULL(FORMAT(CAM.fecha_fin, 'dd/MM/yyyy'), '...'), ')') AS 'descripcion_campania',
		CAMP.anio AS 'campania_anio',
		BA.dia_crecimiento,
		BA.semana_crecimiento,
		BA.idestado_fenologico,
		BA.idestado_fenologico_detalle,
		FV.id AS 'idfenologia_variedad',
		FV.nombre AS 'fenologia_variedad',
		BA.area_total,
		BA.area_sembrada,
		BAS.id AS 'idbitacora_agricola_sanitaria',
		TCA.id AS 'idtipo_concepto',
		TCA.nombre AS 'tipo_concepto',
		CA.nombre AS 'concepto_agricola',
		ESCA.organo_afectado,
		BAS.glosa,
		BSE.ruta,
		CAM.codigo as 'codigo_campania',
		MEA.nombre as 'metodo_evaluacion',
		UM.nombre as 'unidad_medida',
		BAS.valor_encontrado
	FROM TRBITACORA_AGRICOLA BA
	LEFT JOIN TMTIPO_REGISTRO_BITACORA TRB ON TRB.id = BA.idtipo_registro
	LEFT JOIN TMEVALUADOR E ON E.id = BA.idevaluador
	LEFT JOIN TMUSUARIO_PERFIL UP ON UP.id = E.idusuario_perfil
	LEFT JOIN TMUSUARIO U ON U.id = UP.idusuario
	LEFT JOIN TMCENTROCOSTO CC ON CC.id = BA.idcentro_costo
	LEFT JOIN TMCULTIVO C ON C.id = BA.idcultivo
	LEFT JOIN TMCULTIVO_VARIEDAD CV ON CV.id = BA.idcultivo_variedad
	LEFT JOIN TMSIEMBRA SIEM ON SIEM.id = BA.idsiembra
	LEFT JOIN TMCAMPANIA CAM ON CAM.id = BA.idcampania
	LEFT JOIN TMCAMPANIA_AGRICOLA CAMP ON CAMP.id = BA.idcampania_agricola
	LEFT JOIN TRBITACORA_AGRICOLA_SANITARIA BAS ON BA.id = BAS.idbitacora_agricola
	LEFT JOIN TRBITACORA_SANITARIAS_EVIDENCIAS BSE ON BSE.idbitacora_agricola_sanitaria = BAS.id
	LEFT JOIN TMESTADO_FENOLOGICO_DETALLE EFD ON EFD.id = BA.idestado_fenologico_detalle
	LEFT JOIN TMFENOLOGIA_VARIEDAD FV ON FV.id = EFD.idfenologia_variedad
	LEFT JOIN TMTIPO_CONCEPTO_AGRICOLA TCA ON TCA.id = BAS.idtipo_concepto
	LEFT JOIN TMCONCEPTO_AGRICOLA CA ON CA.id = BAS.idconcepto
	LEFT JOIN TMEVALUACION_SUBCONCEPTO_CULTIVO ESCA ON ESCA.id = BAS.idevaluacion_subconcepto
	LEFT JOIN TMMETODO_EVALUACION_AGRICOLA MEA ON MEA.id = BAS.idmetodo_evaluacion
	LEFT JOIN TMUNIMEDIDA UM ON UM.id = BAS.idmedida
	LEFT JOIN TMUMBRAL_RANGO UR ON UR.id = BAS.idumbral_rango
	LEFT JOIN TMMETODO_EVALUACION_DETALLE MED ON MED.id = BAS.idmetodo_evaluacion_detalle
	order by fecha desc`)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(o)
}

// (
// 	SELECT
// 		BSE.ruta
// 		FROM TRBITACORA_SANITARIAS_EVIDENCIAS BSE
// 		WHERE BSE.idbitacora_agricola_sanitaria = BAS.id
// 		for JSON path
// 			) AS 'ruta',

// func GetBinnacleTable(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
// 	result, err := user.Sql.ExecJson(spBinnacleTable+constants.ListSuffix, user.CompanyId)
// 	if err != nil {
// 		return httpmessage.Error(err)
// 	}
// 	return httpmessage.Json(result)
// }
func GetBinnacleDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")

	result, err := user.Sql.ExecJson(spBinnacle+constants.DetailSuffix,
		user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

type sanitaryBody struct {
	Concept                   string      `json:"concepto"`
	Comment                   string      `json:"glosa"`
	IdConcept                 interface{} `json:"idconcepto"`
	IdMedida                  interface{} `json:"idmedida"`
	IdEvaluationMethod        interface{} `json:"idmetodo_evaluacion"`
	IdEvaluationMethodDetail  interface{} `json:"idmetodo_evaluacion_detalle"`
	IdEvaluationSubConcept    interface{} `json:"idevaluacion_subconcepto"`
	IdSubConceptAgricola      interface{} `json:"idsubconcepto_agricola"`
	IdConceptCrop             interface{} `json:"idconcepto_cultivo"`
	IdConceptType             interface{} `json:"idtipo_concepto"`
	IdThresholdRange          interface{} `json:"idumbral_rango"`
	EvaluationMethod          string      `json:"metodo_evaluacion"`
	Evidences                 []evidences `json:"imagenes"`
	Organ                     interface{} `json:"organo_afectado"`
	SubConceptAgricola        string      `json:"subconcepto_agricola"`
	UniMedida                 string      `json:"unimedida"`
	Value                     interface{} `json:"valor_encontrado"`
	UbicacionRegistroLatitud  interface{} `json:"ubicacion_registro_latitud"`
	UbicacionRegistroLongitud interface{} `json:"ubicacion_registro_longitud"`
}

type evidences struct {
	Path interface{} `json:"ruta"`
	Uuid interface{} `json:"imagen_uuid"`
	Data interface{} `json:"data,omitempty"`
}

func CreateUpdateBinnacle(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id, err := utils.GetIntVarIds(r, "id")
	if err != nil {
		return httpmessage.Error(locale.ValidationError)
	}
	fmt.Println(user.NoSql.StringConnection)

	var body binnacleBody
	raw := utils.ParseBody(r, &body)

	//client := user.NoSql.Collection(user.ConnectionId, "")
	uri := `mongodb://agritareo:admin2021.rar@134.209.170.209:27017`
	client, err := mongo.NewClient(options.Client().ApplyURI(uri))
	if err != nil {
		return httpmessage.Error(err)

	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		return httpmessage.Error(err)

	}

	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		return httpmessage.Error(err)
	}

	println(user.CorporationId)
	database := client.Database(user.CorporationId)
	bucket, err := gridfs.NewBucket(
		database,
	)
	if err != nil {
		return httpmessage.Error(err)
	}
	var sanitary []sanitaryBody
	var subImages []evidences
	d, _ := json.Marshal(body.SanitaryEvaluation)
	_ = json.Unmarshal(d, &sanitary)

	//db := base64.StdEncoding.EncodeToString([]byte(user.NoSql.Database + "_" + user.NoSql.Id))
	db := base64.StdEncoding.EncodeToString([]byte(user.NoSql.Id))
	//	origin := mode(false)
	pathNs := "https://api.gesagricola.nisiracloud.com.pe/v1"
	for i, val := range sanitary {
		for j, k := range val.Evidences {
			if k.Data != nil {
				name, _ := uuid.NewV4()
				key := strings.ToUpper(fmt.Sprintf("%v", name))
				//https://api.gesagricola.nisiracloud.com.pe/gesagricola/app
				uri := fmt.Sprintf("%v/show-images?key=%v&d=%v", pathNs, key, db)
				subImages = append(subImages, evidences{
					Uuid: key,
					Path: uri,
					Data: k.Data,
				})
				sanitary[i].Evidences[j].Path = uri
				sanitary[i].Evidences[j].Uuid = key
				sanitary[i].Evidences[j].Data = ""
			}
		}
	}
	body.SanitaryEvaluation = sanitary

	result, err := user.Sql.ExecJson(spBinnacle+constants.InsertUpdateSuffix,
		user.CompanyId,
		id,
		utils.JsonString(body),
		user.UserId)

	if err != nil {
		return httpmessage.Error(err)
	}
	for _, k := range subImages {
		up, err := bucket.OpenUploadStream(
			strings.ToUpper(fmt.Sprintf(`%v`, k.Uuid)),
		)
		if err != nil {
			return httpmessage.Error(err)
		}
		defer up.Close()
		datai := k.Data.(string)
		b64data := datai[strings.IndexByte(datai, ',')+1:]
		data, err := base64.StdEncoding.DecodeString(b64data)
		if err != nil {
			return httpmessage.Error("Formato de imagen incorrecto")
		}

		dataResponse := data
		a, _, _ := image.DecodeConfig(bytes.NewReader(data))

		if a.Height >= 1200 || a.Width >= 1200 {
			wi := a.Width
			he := a.Height
			porc := 0

			for wi > 1100 || he > 1100 {

				if wi > 1000 && wi < 1300 || he > 1000 && he < 1300 {
					porc = porc + 1
				} else {
					porc = porc + 10
				}

				tempWi := wi - (porc * wi / 100)
				wi = tempWi
				// ----------
				tempHe := he - (porc * he / 100)
				he = tempHe
			}
			// todo
			i, _, _ := image.Decode(bytes.NewReader(data))

			ni := resize.Resize(uint(wi), uint(he), i, resize.Lanczos3)
			buf := new(bytes.Buffer)
			err = jpeg.Encode(buf, ni, nil)
			if err != nil {
				return httpmessage.Error(err)
			}
			dataResponse = buf.Bytes()

		}
		_, _ = up.Write(dataResponse)
	}
	return httpmessage.Send(result, raw)
}

//APP MOVIL
func CreateUpdateBinnacleAppMovil(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id, err := utils.GetIntVarIds(r, "id")
	if err != nil {
		return httpmessage.Error(locale.ValidationError)
	}
	fmt.Println(user.NoSql.StringConnection)

	var body binnacleBody
	raw := utils.ParseBody(r, &body)
	//client := user.NoSql.Collection(user.ConnectionId, "")
	uri := `mongodb://agritareo:admin2021.rar@134.209.170.209:27017`
	client, err := mongo.NewClient(options.Client().ApplyURI(uri))
	if err != nil {
		return httpmessage.Error(err)

	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		return httpmessage.Error(err)

	}

	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		return httpmessage.Error(err)
	}
	//database := client.Database()
	//bucket, _ := gridfs.NewBucket(
	//	database,
	//)

	println(user.CorporationId)
	database := client.Database(user.CorporationId)
	bucket, err := gridfs.NewBucket(
		database,
	)
	if err != nil {
		return httpmessage.Error(err)
	}
	var sanitary []sanitaryBody
	var subImages []evidences
	d, _ := json.Marshal(body.SanitaryEvaluation)
	_ = json.Unmarshal(d, &sanitary)

	//var sanitary []sanitaryBody
	//var subImages []evidences
	//d, _ := json.Marshal(body.SanitaryEvaluation)
	//_ = json.Unmarshal(d, &sanitary)

	db := base64.StdEncoding.EncodeToString([]byte(user.NoSql.Id))

	//origin := mode(false)
	pathNs := "https://api.gesagricola.nisiracloud.com.pe/v1"
	for i, val := range sanitary {
		for j, k := range val.Evidences {
			if k.Data != nil {
				name, _ := uuid.NewV4()
				key := strings.ToUpper(fmt.Sprintf("%v", name))
				uri := fmt.Sprintf("%v/show-images?key=%v&d=%v", pathNs, key, db)
				subImages = append(subImages, evidences{
					Uuid: key,
					Path: uri,
					Data: k.Data,
				})
				sanitary[i].Evidences[j].Path = uri
				sanitary[i].Evidences[j].Uuid = key
				sanitary[i].Evidences[j].Data = ""
			}
		}
	}
	body.SanitaryEvaluation = sanitary

	result, err := user.Sql.ExecJson(spBinnacleMovil+constants.InsertUpdateSuffix,
		user.CompanyId,
		id,
		utils.JsonString(body),
		user.UserId)

	if err != nil {
		return httpmessage.Error(err)
	}
	for _, k := range subImages {
		up, err := bucket.OpenUploadStream(
			strings.ToUpper(fmt.Sprintf(`%v`, k.Uuid)),
		)
		if err != nil {
			return httpmessage.Error(err)
		}
		defer up.Close()
		datai := k.Data.(string)
		b64data := datai[strings.IndexByte(datai, ',')+1:]
		data, err := base64.StdEncoding.DecodeString(b64data)
		if err != nil {
			return httpmessage.Error("Formato de imagen incorrecto")
		}
		_, _ = up.Write(data)
	}
	fmt.Println(result)
	return httpmessage.Send(result, raw)

}

func DeleteBinnacle(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//EXEC NS_BITACORA_AGRICOLA_SANITARIA_D @idempresa = 109, @id = 1385, @idusuario = 9, @culture = 'Español'
	id := utils.GetIntVar(r, "id")

	result, err := user.Sql.ExecJson(spBinnacle+constants.DetailSuffix,
		user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}

	var data binnacleBody
	var uuids []interface{}
	err = json.Unmarshal([]byte(result), &data)
	if err != nil {
		return httpmessage.Error(err)
	}
	if data.SanitaryEvaluation != nil {
		for _, i := range data.SanitaryEvaluation.([]interface{}) {
			val := i.(map[string]interface{})
			detail := val["imagenes"].([]interface{})
			for _, j := range detail {
				val2 := j.(map[string]interface{})

				uuids = append(uuids, val2["imagen_uuid"])
			}
		}
	}

	_, err = user.Sql.ExecJson("BITACORA_AGRICOLA_SANITARIA_D", user.CompanyId, id, user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	client := user.NoSql.Collection(user.ConnectionId, "")
	db := client.Database()
	for _, i := range uuids {
		res := db.Collection("fs.files").FindOne(context.TODO(), bson.M{"filename": i})
		if res != nil {
			r, err := res.DecodeBytes()
			//refactor
			if err == nil {
				log.Debug("imagen encontrada")
				vb := r.Index(0).Value().ObjectID()
				fmt.Println(vb)
				_, err = db.Collection("fs.files").DeleteOne(context.TODO(), bson.M{"_id": vb})
				if err != nil {
					fmt.Println("error fs.files")
				}
				_, err = db.Collection("fs.chunks").DeleteOne(context.TODO(), bson.M{"files_id": vb})
				if err != nil {
					fmt.Println("error fs.chunks")
				}
			}

		}

	}
	return httpmessage.Empty()
}

//GGG
/////////////////////////////////////////////////DETAIL
type detailBinnacle struct {
	Date         interface{} `json:"fecha" validate:"required,notBlank"`
	IdCostCenter interface{} `json:"parcela" validate:"required,notBlank"`
}

func GetPlotData(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	d := utils.GetQuery(r, "fecha")
	c := utils.GetQuery(r, "parcela")
	body := detailBinnacle{
		Date:         d,
		IdCostCenter: c,
	}
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	result, err := user.Sql.ExecJson(spTerrainData+constants.DetailSuffix,
		body.Date,
		body.IdCostCenter,
		user.UserId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func GetBinnacleTypeList(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	result, err := user.Sql.ExecJson(spTypeBinnacle + constants.ListSuffix)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func SubConcepts(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	ca := utils.GetQuery(r, "ca")
	c := utils.GetQuery(r, "c")
	result, err := user.Sql.ExecJson(spBinnacleSubConcept+constants.DetailSuffix,
		ca, c)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func SubConceptsCEZL(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//BITACORA_SUBCONCEPTO_CULTIVO
	result, err := user.Sql.ExecJson(spBinnacleSubConcept + "_APP")
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func EvaluacionesApp(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	result, err := user.Sql.ExecJson("BITACORA_APP")
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func Threshold(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	me := utils.GetQuery(r, "me")
	fv := utils.GetQuery(r, "fv")
	cv := utils.GetQuery(r, "cv")
	result, err := user.Sql.ExecJson(spBinnacleThreshold+constants.DetailSuffix,
		me, fv, cv)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

//////////////////test -> mover a utils
func dateFunc(v string) interface{} {
	if v == "" || len(v) < 8 {
		return nil
	}
	return v
}

//ssss
//sasa
//asdsa
func GetPhytosanitaryReport(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
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
	result, err := user.Sql.ExecJson(spBinnacleReport+constants.DetailSuffix,
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

func GetPhytosanitaryReportGraphic(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var f1, f2 interface{}
	f1 = dateFunc(utils.GetQuery(r, "i", "").(string))
	f2 = dateFunc(utils.GetQuery(r, "f", "").(string))
	result, err := user.Sql.ExecJson(spBinnacleReportGraphic+constants.DetailSuffix,
		user.CompanyId,
		user.UserId,
		f1,
		f2)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func GetPhytosanitaryDetailReport(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body []physotanitaryDetail
	// inputs
	var f1, f2 interface{}
	f1 = dateFunc(utils.GetQuery(r, "i", "").(string))
	f2 = dateFunc(utils.GetQuery(r, "f", "").(string))
	//---------------------------------
	layout := "2006-01-02"
	f1ToDate, err := time.Parse(layout, f1.(string))
	f2ToDate, err := time.Parse(layout, f2.(string))
	f1week := f1ToDate.Add(-168 * time.Hour)
	f2week := f1ToDate.Add(-336 * time.Hour)
	fechaFinal := f2week.Format("2006-01-02")
	if err != nil {
		return httpmessage.Error(err)
	}
	result, err := user.Sql.ExecJson(spBinnacleReportDetail+constants.DetailSuffix,
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
	var md []dataFitosanidad
	for _, i := range body {
		fec, _ := time.Parse(layout, i.Fecha)
		valorFloat, _ := strconv.ParseFloat(i.ValorEncontrado, 64)
		var ok bool
		var currentIndex int
		for vl, x := range md {
			if x.Name == i.Concepto {
				currentIndex = vl
				ok = !ok
			}
		}
		if ok {
			var s1, s2, s3 float64
			if fec.Before(f1week) {
				s2 = valorFloat
			} else if fec.Before(f2week) {
				s1 = valorFloat
			} else if fec.Before(f2ToDate) {
				s3 = valorFloat
			} else {
				s3 = valorFloat
			}
			p := &md[currentIndex]
			p.Value = p.Value + valorFloat
			p.OneWeek = p.OneWeek + s1
			p.TwoWeek = p.TwoWeek + s2
			p.Current = p.Current + s3
			//fmt.Println(s1, s2, s3, i.Fecha)
			//fmt.Println(p.OneWeek, p.TwoWeek, p.Current, "---", fec, i.Concepto, valorFloat, "acumulado:", p.Value)
		} else {
			var s1, s2, s3 float64
			if fec.Before(f1week) {
				s2 = valorFloat
			} else if fec.Before(f2week) {
				s1 = valorFloat
			} else if fec.Before(f2ToDate) {
				s3 = valorFloat
			}
			// creas e inicializar fechas
			df := dataFitosanidad{
				Name:    i.Concepto,
				OneWeek: s1,
				TwoWeek: s2,
				Current: s3,
				Value:   valorFloat,
			}
			md = append(md, df)
		}
	}
	var df = DataFecha{
		Data:  json.RawMessage(result),
		Table: md,
	}
	return httpmessage.Send(df)
}

func GetPhytosanitaryDetail(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	var body []physotanitaryDayDetail
	// inputs
	var f1, f2 interface{}
	f1 = dateFunc(utils.GetQuery(r, "i", "").(string))
	f2 = dateFunc(utils.GetQuery(r, "f", "").(string))
	//---------------------------------

	result, err := user.Sql.ExecJson(spBinnacleDetail+constants.DetailSuffix,
		user.CompanyId,
		user.UserId,
		f1,
		f2,
		id)
	if err != nil {
		return httpmessage.Error(err)
	}
	err = json.Unmarshal([]byte(result), &body)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

//DASHBOARD
func GetEvaluatorsDashBoard(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//var f1, f2 interface{}
	var pd binnacle.PhytosanityDates
	var e evaluator
	fechanow := time.Now()
	// utilizar este por si quiero hacer de un año atras
	//fechalast := fechanow.AddDate(0,0,0)
	pd.FechaFin = fmt.Sprintf(`%v/%v/%v`, fechanow.Year(), int(fechanow.Month()), fechanow.Day())
	pd.FechaInicio = fmt.Sprintf(`%v/%v/%v`, fechanow.Year(), int(fechanow.Month()), 1)
	result, err := user.Sql.ExecJson(spBinnacleReport+constants.DetailSuffix,
		user.CompanyId,
		user.UserId,
		pd.FechaInicio,
		pd.FechaFin)
	if err != nil {
		return httpmessage.Error(err)
	}
	err = json.Unmarshal([]byte(result), &e)
	if err != nil {
		return httpmessage.Error(err)
	}
	var res []resultados
	for _, i := range e.LotesDetail {
		if len(i.LotesDetailEvaluations) > 0 {
			//println(len(i.LotesDetailEvaluations))
			for _, k := range i.LotesDetailEvaluations {
				if len(res) == 0 {
					var pg []plagueDetail
					pg = append(pg, plagueDetail{
						Plague: k.ConceptAgriculture,
						Total:  0,
					})
					res = append(res, resultados{
						Name:       k.Evaluator,
						NameLote:   k.NameLote,
						Plague:     pg,
						ListPlague: k.ConceptAgriculture,
					})
				}
				for m, j := range res {
					if j.Name == k.Evaluator {

						for n, _ := range j.Plague {
							ok := strings.Contains(res[m].ListPlague, k.ConceptAgriculture)
							if !ok {
								res[m].ListPlague = res[m].ListPlague + ", " + k.ConceptAgriculture
								//fmt.Println(!ok, len(k.ConceptAgriculture), j.ListPlague, k.ConceptAgriculture)
								res[m].Plague = append(res[m].Plague, plagueDetail{
									Plague: k.ConceptAgriculture,
									Total:  1,
								})
							} else {
								if res[m].Plague[n].Plague == k.ConceptAgriculture {
									res[m].Plague[n].Total = res[m].Plague[n].Total + 1
									//fmt.Println("res[m]",res[m].Plague, "K", k.ConceptAgriculture)
								}
							}
						}
					}
				}
			}
		}
	}
	//fmt.Println(res)

	return httpmessage.Send(res)
}
