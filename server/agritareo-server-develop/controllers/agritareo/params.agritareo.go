package agritareo

import (
	"net/http"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
)

const params = "PARAMETROS_COMPONENTE_F"

type component struct {
	IdComponentCompany *int     `db:"idpempresa_componente" json:"idpempresa_componente"`
	IdCompany          *int     `db:"idpempresa" json:"idpempresa"`
	IdParam            *int     `db:"idparametro" json:"idparametro"`
	Param              *string `db:"parametro" json:"parametro"`
	Description        *string `db:"descripcion" json:"descripcion"`
	Value              *string `db:"valor" json:"valor"`
}

func GetParams(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	cid := utils.GetVar(r, "id")
	var result []component
	err := user.Sql.SelectProcedure(&result, params, user.CompanyId, user.UserId, cid)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Send(result[0])
}
