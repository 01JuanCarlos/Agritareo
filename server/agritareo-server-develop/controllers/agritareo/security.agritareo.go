package agritareo

import (
	"fmt"
	"net/http"
	"ns-api/common/utils"
	"ns-api/core/server"
	"ns-api/core/sts"
)

type Source struct {
	Data string `json:"data"`
}

func EncriptarData(user *sts.Client, r *http.Request) *sts.HttpResponse {
	var body Source
	_ = utils.ParseBody(r, &body)
	fmt.Println(body.Data)
	dataEncriptada := utils.Encriptar(body.Data)
	fmt.Println(dataEncriptada)
	return server.Message(dataEncriptada)
}
