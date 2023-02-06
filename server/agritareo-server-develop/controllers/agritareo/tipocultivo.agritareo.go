package agritareo

import (
	"net/http"
	"ns-api/core/server"
	"ns-api/core/sts"
)

type tipoCultivoBody struct {
	IdTipoCultivo     int    `db:"idtipocultivo" json:"idtipocultivo,omitempty"`
	NombreTipoCultivo string `db:"nombretipocultivo" json:"nombretipocultivo"`
}

func GetTipoCultivo(user *sts.Client, r *http.Request) *sts.HttpResponse {
	var tipoCultivo []tipoCultivoBody
	err := user.Sql.Select(&tipoCultivo, `select * from TMTIPOCULTIVO`)
	if nil != err {
		return server.ErrorMessage(err)
	}
	return server.Message(tipoCultivo)
}
