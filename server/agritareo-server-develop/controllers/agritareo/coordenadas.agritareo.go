package agritareo

import (
	"encoding/json"
	"log"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server"
	"ns-api/core/sts"
)

type coordenadasInsertBody struct {
	Latitud  *string `db:"latitud" json:"latitud"`
	Longitud *string `db:"longitud" json:"longitud"`
}

type coordenadasJsonBody struct {
	IdSiembra int         `db:"idsiembra" json:"idsiembra"`
	Data      interface{} `json:"coordenadas"`
	// Latitud   string      `db:"latitud" json:"latitud"`
	// Longitud  string      `db:"longitud" json:"longitud"`
}

func PostCoordenadas(user *sts.Client, r *http.Request) *sts.HttpResponse {
	var body coordenadasJsonBody
	raw := utils.ParseBody(r, &body)
	//fmt.Println("fail", body)
	var coordinates []map[string]interface{}
	_ = json.Unmarshal([]byte(body.Data.(string)),&coordinates)
	for i,_ := range coordinates {
		coordinates[i]["idsiembra"] = body.IdSiembra
	}
	_, err := user.Sql.ExecJson(constants.PInsertCoordenadas, utils.JsonString(coordinates))
	if err != nil {
		log.Println(err)
		return server.ErrorMessage(err)
	}

	return server.EmptyMessage(raw)
}
