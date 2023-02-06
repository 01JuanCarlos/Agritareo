package agritareo

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"ns-api/common/constants"
	"ns-api/core/services/mssql"
	"ns-api/internal/proto"
	"time"
)

type CostCenterClimaBody struct {
	Id          int         `db:"id" json:"id" validate:"required,notBlank"`
	NombreNivel string      `db:"nombrenivel" json:"nombrenivel" validate:"required,notBlank"`
	Latitud     interface{} `json:"latitud" validate:"required,notBlank"`
	Longitud    interface{} `json:"longitud" validate:"required,notBlank"`
}

type climaBody struct {
	Id   int `db:"id" json:"id,omitempty"`
	Main struct {
		Humidity int     `db:"humedad" json:"humidity,omitempty"`
		Temp     float32 `db:"temperatura" json:"temp,omitempty"`
	}
	Weather []struct {
		Description string `json:"description"`
		Icon        string `json:"icon"`
	}
	Wind struct {
		Speed float32 `db:"velocidad" json:"speed,omitempty"`
		Deg   float32 `db:"grados" json:"deg,omitempty"`
	}
	Timezone int    `db:"timezone" json:"timezone"`
	Name     string `db:"nombre" json:"name"`
}

func Duration() time.Duration {
	now := time.Now()
	expectedTime := time.Date(now.Year(), now.Month(), now.Day(), 12, 00, 00, 0, now.Location())
	if now.After(expectedTime) {
		expectedTime = expectedTime.Add(24 * time.Hour)
	}
	newExpTime := expectedTime.Sub(now)
	//log2.Debug("next: ", newExpTime)
	return newExpTime
}

func Climate(lat, lon, id interface{}) (string, error) {
	var climate climaBody

	url := fmt.Sprintf(`http://api.openweathermap.org/data/2.5/weather?lat=%v&lon=%v&appid=%v`, lat, lon, "f6cecccfc95d360dd9a45b322fce04f4")
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}
	//fmt.Println(string(body))
	err = json.Unmarshal(body, &climate)
	if err != nil {
		return "", err
	}
	//fmt.Println(climate)
	start := time.Now()
	//fmt.Println(start)
	d := time.Date(start.Year(), start.Month(), start.Day(), 23, start.Minute(), start.Second(), start.Nanosecond(), time.UTC)
	year, month, day := d.Date()

	//fmt.Println(d)

	fmt.Printf("year = %v\n", year)
	fmt.Printf("month = %v\n", month)
	fmt.Printf("day = %v\n", day)

	if len(climate.Weather) == 0 {
		return "", errors.New("ERROR")
	}
	//fmt.Println(climate)
	query := fmt.Sprintf(`exec ns_%v %v,'%v','%v',%v,%v,%v,'%v',%v,%v`, constants.CInsertClima,
		climate.Main.Humidity,
		climate.Weather[0].Description,
		climate.Weather[0].Icon,
		climate.Wind.Speed,
		climate.Wind.Deg,
		climate.Timezone,
		climate.Name,
		climate.Main.Temp,
		id)
	return query, nil
}

func Clima(appCorp []*proto.RegisterResponse_Corporation) {
	var c []CostCenterClimaBody
	for _, i := range appCorp {
		if i.SubDomain == "mosquetaperu" || i.SubDomain == "pirona" || i.SubDomain == "mosquetaagricola" || i.SubDomain == "agritareo"{
			//fmt.Println("DATA DE LA EMPRESA", i)
			db, err := mssql.DB.ConnectIfNotExists(i.Id)
			if db != nil{
				err = db.Select(&c, `select CC.id, CC.nombrenivel, zona.latitud, zona.longitud from TMCENTROCOSTO CC 
											JOIN TMZONA_GEOGRAFICA zona on zona.id = CC.idzona_geografica
											where idnivelconfiguracion = 11`)
				if err != nil {
					fmt.Println(err)
				}
				for _, j := range c {
					//fmt.Println(j)
					result, _ := Climate(j.Latitud, j.Longitud, j.Id)
					_, err := db.Exec(result)
					if err != nil {
						fmt.Println(err)
					}
				}
			}
		}
	}

	time.AfterFunc(Duration(), func() {
		Clima(appCorp)
	})

}
