package controllers

import (
	"net/http"
	"ns-api/business/maintainerBusiness"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"regexp"
	"strconv"
)

func GetSuggest(user *sts.Client, r *http.Request) httpmessage.HttpMessage{
	var re = regexp.MustCompile(`'`)
	q := utils.GetQuery(r, "q", "")
	cid := utils.GetQuery(r, "cid", "").(string)
	q = re.ReplaceAllString(q.(string), ``)
	limit := utils.GetQuery(r, "l", "10")
	filter := utils.GetQuery(r, "f")
	code := utils.GetQuery(r, "c")
	advanced, _ := strconv.Atoi(utils.GetQuery(r, "a", "0").(string))
	advancedFilter := utils.GetQuery(r, "af", "").(string)
	if advancedFilter == "null" {
		advancedFilter = ""
	}
	if code == nil {
		code = ""
	} else if code != "" {
		q = code
	}
	rs,rst,err := maintainerBusiness.MtBusinnes.AutoExecSg(user, cid, q, limit, advancedFilter, advanced, filter)
	//fmt.Println("rs-->",rs)
	//fmt.Println("rst-->",rst)
	//fmt.Println("err-->",err)
	if err != nil {
		return httpmessage.Error(err)
	}else if rs != nil {
		return httpmessage.Send(rs)
	}else {
		return httpmessage.Send(rst)
	}
}
