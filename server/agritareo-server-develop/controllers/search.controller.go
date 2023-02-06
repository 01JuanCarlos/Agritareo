package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
)

type searchBody struct {
	Components interface{} `json:"components"`
	Id         int         `json:"id"`
	Label      string      `json:"label"`
}

func Search(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	search := utils.GetVar(r, "id")
	var body []searchBody
	err := user.Sql.SelectProcedure(&body, "SEARCH_TOPBAR", user.CompanyId, user.UserId, search)
	if err != nil {
		return httpmessage.Error(err)
	}
	for j, i := range body {
		var comp []map[string]interface{}
		_ = json.Unmarshal([]byte(i.Components.(string)), &comp)
		fmt.Println(i)
		body[j].Components = comp
	}
	return httpmessage.Send(body)
}
