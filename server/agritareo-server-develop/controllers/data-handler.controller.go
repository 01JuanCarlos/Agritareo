package controllers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"ns-api/business"
	"ns-api/common/constants"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/core/errors"
	"ns-api/core/filemanager"
	"ns-api/core/server/httpmessage"
	"ns-api/core/services/mssql"
	"ns-api/core/sts"
	"ns-api/locale"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
)

const (
	ComponentTypeForm  = 1
	ComponentTypeTable = 0
	ComponentTypeTree  = 2
	ActionTypePrint    = 0

	procedureIdField   = "pid"
	componentTypeField = "tid"
	actionTypeField    = "aid"
	componentIdField   = "cid"
)

type Fm struct {
	Proc string `json:"proc"`
	Data string `json:"data"`
}

type metaTable struct {
	Header    interface{} `json:"header"`
	Detail    interface{} `json:"detail"`
	View      interface{} `json:"view"`
	Procedure string      `json:"proc,omitempty"`
}

func PDFormat(db *mssql.DatabaseConnection, user string, w http.ResponseWriter, r *http.Request, c, f, o interface{}) (err error, msg bool) {
	var result []Fm
	var RData, RProcedure string
	err = db.SelectProcedure(&result, constants.PGetFormatPrint, user, c)
	if nil != err {
		logger.Debug(err)
		return
	}
	logger.Debug("Result of Format: ", result)
	if len(result) != 0 {
		RData = result[0].Data
		RProcedure = result[0].Proc
		msg = true
		logger.Debug("msg:", msg)
	} else {
		logger.Debug("msg:", msg)
		return
	}
	var data string
	if o != "" {
		decode, _ := base64.URLEncoding.DecodeString(o.(string))
		data = string(decode)
	} else {
		_, _, search, sort := utils.QueryPagination(r)
		data, err = db.ExecJson(RProcedure, user, search, sort)
	}

	if nil != err {
		logger.Debug(err)
		return
	}
	output := bson.M{
		"report":       json.RawMessage(RData),
		"outputFormat": "pdf",
		"data":         json.RawMessage(data),
		"isTestData":   true,
	}
	rs, _ := json.Marshal(output)
	id, err := utils.GeneratePDF(rs)
	if nil != err {
		logger.Error("DataHandler[PDFormat] GeneratePDF: %s", err.Error())
		return
	}

	if pdfFile, err := filemanager.ReadPdfFile(id); err != nil {
		logger.Error("DataHandler[PDFormat] ReadFile: %s", err.Error())
	} else {
		w.Write(pdfFile)
	}
	return
}

func GetPrint(user *sts.Client, r *http.Request, w http.ResponseWriter) httpmessage.HttpMessage {
	c := utils.GetQuery(r, "c")
	f := utils.GetQuery(r, "f")
	o := utils.GetQuery(r, "o")
	//fmt.Println(c, f, o)
	err, ok := PDFormat(user.Sql, user.CompanyId, w, r, c, f, o)
	if nil != err {
		logger.Debug(err)
		return httpmessage.Error(err, http.StatusNotFound)
	}
	if !ok {
		return httpmessage.Error(locale.FormatNotFound, http.StatusNotFound)
	}
	return httpmessage.Stream([]byte{}, "application/pdf")
}

func DeleteDataHandler(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	procedureID := utils.GetQuery(r, "pid")
	procedure := utils.ProcedureIdDecrypt(procedureID.(string))
	completeProcedure := fmt.Sprintf(`%v_D`, strings.ToUpper(procedure))
	exist := constants.CurrentTables[completeProcedure]
	if exist != "" { // match procedure
		rs, err := business.RegisterExists.Exists(user, exist, id, "")
		if err != nil {
			return httpmessage.Error(err)
		}
		if rs != nil {
			return httpmessage.Error(locale.SomethingBadHappened, err, rs)
		}
	}
	if _, err := user.Sql.ExecJson(completeProcedure, user.CompanyId, id); err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(id)
}

func GetDataHandler(user *sts.Client, r *sts.HttpRequest) (httpmessage.HttpMessage, error) {
	procedureId := r.Query.Get(procedureIdField).String()
	componentType := r.Query.Get(componentTypeField).Int()
	actionType := r.Query.Get(actionTypeField, -1).Int()
	componentId := r.Query.Get(componentIdField).String()

	if ComponentTypeTable == componentType || ComponentTypeTree == componentType {
		page := r.Query.Get("start").Int()
		size := r.Query.Get("length", 10).Int()
		search := r.Query.Get("search").String()
		sort := r.Query.Get("sort").String()
		filters := r.Query.Get("filters").Base64Decode()

		if ComponentTypeTree == componentType {
			page = 0
			size = 32767
		}

		//EXEC [dbo].[NS_MAINTAINER_LIST] "","*","TMCOMSUMIDOR",10,0,"","","",""

		if ActionTypePrint != actionType {
			if "" != procedureId {

				if "" == sort {
					sort = "{}" // Fix procedure "JSON text is not properly formatted."
				}

				if "" == filters {
					filters = "{}" // Fix procedure "JSON text is not properly formatted."
				}

				result, err := user.Sql.Page(
					fmt.Sprintf(`%v_L`, procedureId),
					user.CompanyId,
					size,
					page,
					search,
					sort,
					filters,
				)

				if nil != err {
					return nil, err
				}

				return httpmessage.Page(
					result.Data,
					result.TotalFiltered,
					result.TotalRows,
				), nil
			}

			if "" == procedureId && 0 < len(componentId) {
				result, err := business.Maintainer.List(user, componentId, page, size, sort, search, filters)

				if err != nil {
					return nil, err
				}

				return httpmessage.Page(
					result.Data,
					result.TotalFiltered,
					result.TotalRows,
				), nil
			}
		} else {
			//err, ok := PDFormat(user.Sql, user.CompanyId, w, r, componentId, "", "")
			//
			//if nil != err {
			//	return nil, errors.NewError(http.StatusNotFound)
			//}
			//
			//if !ok {
			//	return nil, errors.NewError(locale.FormatNotFound, http.StatusNotFound)
			//}
			//return httpmessage.Stream("application/pdf"), nil
			fmt.Println("Print Format.")
		}
	}

	return nil, errors.NewError()

	//if ActionTypePrint != actId {
	//	if ComponentTypeTable == typeId && procedure != "" {
	//	} else if procedure == "" {
	//	} else {
	//		query := fmt.Sprintf(`SELECT * FROM %v FOR JSON PATH`, procedure)
	//		rs, err := user.Sql.Query(query)
	//		if err != nil {
	//			return httpmessage.Error(err)
	//		}
	//		var result string
	//		for rs.Next() {
	//			var temp string
	//			rs.Scan(&temp)
	//			result = result + temp
	//		}
	//		if "" == result {
	//			result = "[]"
	//		}
	//		return httpmessage.Json(result)
	//	}
	//} else {
	//	err, ok := PDFormat(user.Sql, user.CompanyId, w, r, cmpId, "", "")
	//	if nil != err {
	//		return httpmessage.Error(err, http.StatusNotFound)
	//	}
	//	if !ok {
	//		return httpmessage.Error(locale.FormatNotFound, http.StatusNotFound)
	//	}
	//	return server.StreamMessage("application/pdf")
	//}
}
