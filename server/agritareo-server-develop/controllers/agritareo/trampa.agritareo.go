package agritareo

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"log"
	"net/http"
	"ns-api/business"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
	"regexp"
	"strconv"
	"strings"
)

type trampaBody struct {
	Id              int         `db:"id" json:"id,omitempty"`
	IdCategoria     interface{} `db:"idcategoria" json:"idcategoria,omitempty"`
	Nombre          string      `db:"nombre" json:"nombre" validate:"required,notBlank"`
	Codigo          string      `db:"codigo" json:"codigo,omitempty"`
	Numero          interface{} `db:"numero" json:"numero" validate:"notBlank"`
	NombreCategoria string      `db:"nombre_categoria" json:"nombre_categoria,omitempty"`
	NumeroUso       interface{} `db:"numero_uso" json:"numero_uso"`
}

func GetTraps(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var traps []trampaBody
	err := user.Sql.Select(&traps, `select t.id, t.nombre, t.codigo, t.numero, t.idcategoria, tc.nombre as 'nombre_categoria', t.numero_uso from TMTRAMPA t
	inner join TMTRAMPA_CATEGORIA tc on tc.id = t.idcategoria`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(traps)
}

func CreateTraps(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body trampaBody
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.ExecJson(constants.TInsertTrampa,
		user.CompanyId,
		body.Nombre,
		body.Codigo,
		body.Numero,
		body.IdCategoria,
		body.NumeroUso)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func UpdateTraps(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body trampaBody
	id := utils.GetIntVar(r, "id")
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	_, err := user.Sql.Exec(constants.TUpdateTrampa, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func DeleteTraps(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "id")
	_, err := user.Sql.ExecJson(constants.TDeleteTrampa, user.CompanyId, id)
	if nil != err {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

// ----------- Traps
type dataTrap struct {
	Latitude     string `json:"latitud" validate:"required,notBlank"`
	Longitude    string `json:"longitud" validate:"required,notBlank"`
	IdTrap       int    `json:"idtrampa" validate:"required,notBlank"`
	IdCostCenter int    `json:"idcentrocosto" validate:"required,notBlank"`
}
type trapBody struct {
	Traps []dataTrap `json:"trampas" validate:"required,notBlank"`
}

func CreateTrapsData(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body trapBody
	raw := utils.ParseBody(r, &body)
	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	tx, err := user.Sql.Begin()
	if err != nil {
		return httpmessage.Error(err)
	}
	defer tx.Rollback()

	// update Stock
	allIdStock := make(map[int]int)
	for _, i := range body.Traps {
		allIdStock[i.IdTrap] = allIdStock[i.IdTrap] + 1
	}
	for id, quantity := range allIdStock {
		_, err = tx.Query(fmt.Sprintf(
			`
			update tmtrampa set numero_uso = numero_uso - %v where id = %v and numero_uso - %v >= 0
			if @@ROWCOUNT = 0
				throw 50003, '--', 10
		`, quantity, id, quantity))
		if err != nil {
			return httpmessage.Error(err, fmt.Sprintf(`Stock de trampa con id '%v' insuficiente.`, id))
		}
	}

	for _, j := range body.Traps {
		var count int
		rows, err := tx.Query(fmt.Sprintf(`
		SELECT COUNT(*) FROM TMTRAMPA_SIEMBRA WHERE idtrampa = '%v' AND idcentrocosto  = '%v'`, j.IdTrap, j.IdCostCenter))
		if err != nil {
			return httpmessage.Error(err)
		}
		for rows.Next() {
			if err := rows.Scan(&count); err != nil {
				return httpmessage.Error(err)
			}
		}
		formatResult := fmt.Sprintf("%04d", count+1)

		lat, _ := strconv.ParseFloat(j.Latitude, 64)
		long, _ := strconv.ParseFloat(j.Longitude, 64)

		if lat == 0 || long == 0 {
			return httpmessage.Error("Coordenadas incorrectas")
		}
		point := fmt.Sprintf(`POINT(%v %v)`, long, lat)
		query := fmt.Sprintf(`
			INSERT INTO TMTRAMPA_SIEMBRA(
				idcentrocosto,
				idtrampa,
				generate,
				coordenadas) VALUES(
				%v,%v,'%v',%v)`,
			j.IdCostCenter,
			j.IdTrap,
			formatResult,
			point)
		_, err = tx.Query(query)
		if err != nil {
			return httpmessage.Error(err)
		}
		defer rows.Close()
	}

	if err := tx.Commit(); err != nil {
		return httpmessage.Error(err)
	}

	return httpmessage.Log(raw)
}

func GetTrampaData(user *sts.Client, r *http.Request) httpmessage.HttpMessage {

	result, err := user.Sql.ExecJson("TRAMPADATA_L", user.CompanyId)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Json(result)
}

func DeleteTrapData(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetIntVar(r, "tid")
	query := constants.Exist(constants.TTrapSowing, id)
	// constants msg
	_, err := user.Sql.Query(query)
	if err != nil {
		return httpmessage.Error(err, "No existe ningun registro con este identificador")
	}
	_, err = user.Sql.Query(constants.Delete(constants.TTrapSowing, id))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty() // FIXED
}

// test
//type  Name struct {
//	//Document string `xml:"Document"`
//	Name string `xml:",chardata"`
//}

//type Document struct {
//	Placemark []Placemark `xml:"Placemark"`
//}
//
//type Placemark struct {
//	Name string `xml:"name"`
//}
type Kml struct {
	Document Document `xml:"Document"`
}

type Document struct {
	Placemark []Placemark
}

type Polygon struct {
	OuterBoundaryIs struct {
		LinearRing struct {
			Coordinates string `xml:"coordinates" json:"coordinates"`
		} `xml:"LinearRing" json:"linearring"`
	} `xml:"outerBoundaryIs" json:"outerboundaryis"`
}
type Placemark struct {
	Name          string `xml:"name" json:"name"`
	Description   string `xml:"description" json:"description"`
	StyleUrl      string `xml:"styleUrl" json:"styleurl"`
	MultiGeometry *struct {
		Polygon Polygon `xml:"Polygon" json:"polygon"`
	} `xml:"MultiGeometry" json:"multigeometry,omitempty"`
	Polygon *Polygon `xml:"Polygon" json:"polygon,omitempty"`
}

type finalStruct struct {
	Name        string
	Description string
	Coordinates string
}

func UploadKml(user *sts.Client,r *http.Request) httpmessage.HttpMessage {
	var fs []finalStruct
	data, err := business.Read(r, "test", "files")
	if err != nil {
		return httpmessage.Error(err)
	}
	for _, i := range data {
		kmz := Kml{}
		_ = xml.Unmarshal(i, &kmz)
		re := regexp.MustCompile("[\\s\\p{Zs}]{2,}")
		for _, res := range kmz.Document.Placemark {

			if res.MultiGeometry != nil {
				coor := res.MultiGeometry.Polygon.OuterBoundaryIs.LinearRing.Coordinates

				match := re.ReplaceAllString(coor, " ")
				match1 := strings.TrimSpace(match)
				//res1 := strings.ReplaceAll(match1, ",", "/" )
				//res2 := strings.ReplaceAll(res1, " ", "," )
				//res3 := strings.ReplaceAll(res2, "/", " " )
				//query := fmt.Sprintf(`'POLYGON((%v))',3426`,res3)
				res.MultiGeometry.Polygon.OuterBoundaryIs.LinearRing.Coordinates = match1

				fs = append(fs, finalStruct{
					Name:        res.Name,
					Description: res.Description,
					Coordinates: match1,
				})

			} else {
				coor := res.Polygon.OuterBoundaryIs.LinearRing.Coordinates

				match := re.ReplaceAllString(coor, " ")
				match = strings.TrimSpace(match)
				res.Polygon.OuterBoundaryIs.LinearRing.Coordinates = match
				fs = append(fs, finalStruct{
					Name:        res.Name,
					Description: res.Description,
					Coordinates: match,
				})
			}
		}
	}

	if fs == nil {
		return httpmessage.Error("estructura del archivo incorrecta")
	}
	res, _ := json.Marshal(fs)

	query := fmt.Sprintf(`EXEC NS_CCOSTOS_SYNC_KML @idempresa = 109, @json = '{ "data" : %v}'`, string(res))
	_, err = user.Sql.Query(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}
