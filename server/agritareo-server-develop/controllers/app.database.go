package controllers

import (
	"ns-api/business"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
)

func GetTables(us *sts.Client) (httpmessage.HttpMessage, error) {
	tables, err := business.Database.GetTables(us)

	if nil != err {
		return nil, err
	}

	return httpmessage.Send(tables), nil
}

func GetProcedures(us *sts.Client) (httpmessage.HttpMessage, error) {
	procedures, err := business.Database.GetProcedures(us)

	if nil != err {
		return nil, err
	}

	return httpmessage.Send(procedures), nil
}
