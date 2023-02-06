package warehouse
//
//import (
//	"log"
//	"net/http"
//	"ns-api/common/constants"
//	"ns-api/common/utils"
//	"ns-api/core/server"
//	"ns-api/core/sts"
//	"ns-api/locale"
//)
//
//type subgroupBody struct {
//	//Id      int    `db:"idsubgrupo" json:"id,omitempty"`
//	IdGrupo int    `db:"idgrupo" json:"idgrupo" validate:"required"`
//	Name    string `db:"nombre" json:"label" validate:"required"`
//	// Enabled bool   `db:"habilitado" json:"enabled"`
//}
//
//func PostSubGroup(user *sts.Client, r *http.Request) sts.HttpResponse {
//	var body subgroupBody
//	raw := utils.ParseBody(r, &body)
//	_, err := user.Sql.ExecJson(constants.PInsertSubGroup, user.CompanyId, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	log.Println("Grupo Registrado")
//	return httpmessage.Log(raw)
//}
//
//func PutSubGroup(user *sts.Client, r *http.Request) sts.HttpResponse {
//	id := utils.GetVar(r, "id")
//	var body subgroupBody
//	raw := utils.ParseBody(r, &body)
//	_, err := user.Sql.ExecJson(constants.PUpdateSubGroup, user.CompanyId, id, utils.JsonString(body))
//	if err != nil {
//		log.Println(err)
//		return httpmessage.Error(locale.TryAgainLater)
//	}
//	return httpmessage.Log(raw)
//}
