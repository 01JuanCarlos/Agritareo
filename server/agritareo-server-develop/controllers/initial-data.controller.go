package controllers

import (
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"time"
)

type Initial struct {
	Module     string        `json:"module"`
	LocalTime  time.Duration `json:"time"`
	LoadModule bool          `json:"load_module"`
	Lang       string        `json:"language"`
}

//
//type InitialModules struct {
//	Modules    interface{} `json:"modules"`
//	Components interface{} `json:"components"`
//	Privileges interface{} `json:"privileges"`
//	Parameters interface{} `json:"parameters"`
//}
//type DataUserConfig struct {
//	Alias      interface{} `json:"alias"`
//	Prifile    interface{} `json:"profile"`
//	ProfileId  interface{} `json:"profile_id"`
//	UserId     interface{} `json:"user_id"`
//	Privileges interface{} `json:"privileges"`
//}
//type DataCompanyConfig struct {
//	BusinessName   interface{} `json:"business_name"`
//	CompanyAddress interface{} `json:"company_address"`
//	CompanyID      interface{} `json:"company_id"`
//	CompanyUID     interface{} `json:"company_uid"`
//	Components     interface{} `json:"components"`
//	Modules        interface{} `json:"modules"`
//	Parameters     interface{} `json:"parameters"`
//	ProfileTypeID  interface{} `json:"profile_type_id"`
//}
//
//type InitialData struct {
//	CompanyConfig DataCompanyConfig `json:"company_configuration"`
//	UserConfig    DataUserConfig    `json:"user_configuration"`
//}

func PostInitial(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body Initial
	_ = utils.ParseBody(r, &body)
	if body.Module == "" {
		//session, err := server.SessionStore.Get(r, config.SessionCookieName)
		//userss := &server.UserSession{}
		//
		//if userss1, ok := userss.(*server.UserSession); !ok {
		//	fmt.Println(userss1)
		//}

		//fmt.Println(session.Values, err)
		result, _ := user.Sql.ExecJson(constants.PInitialData, user.CompanyId, user.UserId)
		return httpmessage.Json(result)
		//var idata InitialData
		//result, err := db.MultiRs(constants.PInitialData, user.CompanyId, user.UserId)
		//if err != nil {
		//	log.Println(err)
		//}
		//for i := range result {
		//	if i == 0 {
		//		idata.UserConfig.Alias = result[i][i]["alias"]
		//		idata.UserConfig.Prifile = result[i][i]["profile"]
		//		idata.UserConfig.ProfileId = result[i][i]["profile_id"]
		//		idata.UserConfig.UserId = result[i][i]["user_id"]
		//		idata.CompanyConfig.BusinessName = result[i][i]["business_name"]
		//		idata.CompanyConfig.CompanyAddress = result[i][i]["company_address"]
		//		idata.CompanyConfig.CompanyID = result[i][i]["company_id"]
		//		idata.CompanyConfig.CompanyUID = result[i][i]["company_uid"]
		//		idata.CompanyConfig.ProfileTypeID = result[i][i]["profile_type_id"]
		//	} else if i == 1 {
		//		idata.CompanyConfig.Modules = result[i]
		//	} else if i == 2 {
		//		idata.CompanyConfig.Components = result[i]
		//	} else if i == 3 {
		//		idata.UserConfig.Privileges = result[i]
		//	} else if i == 4 {
		//		idata.CompanyConfig.Parameters = result[i]
		//	}
		//}
		//return utils.RawMessage(utils.JsonString(idata))

	} else {
		result, _ := user.Sql.ExecJson(constants.PInitialModule, user.CompanyId, user.UserId, body.Module)
		return httpmessage.Json(result)
		//var imodules InitialModules
		//result, err := db.MultiRs(constants.PInitialModule, user.CompanyId, user.UserId, body.Module)
		//if err != nil {
		//	log.Println(err)
		//}
		//for i := range result {
		//	if i == 0 {
		//		imodules.Modules = result[i]
		//	} else if i == 1 {
		//		imodules.Components = result[i]
		//	} else if i == 2 {
		//		imodules.Privileges = result[i]
		//	} else if i == 3 {
		//		imodules.Parameters = result[i]
		//	}
		//}
		//return utils.RawMessage(utils.JsonString(imodules))
	}
}
