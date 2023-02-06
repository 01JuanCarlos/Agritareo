package controllers

import (
	"fmt"
	"log"
	"net/http"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
)

func GetFilter(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	af := utils.GetQuery(r, "f", "").(string)
	id := utils.GetQuery(r, "id", "").(string)
	var datax []metaTable
	err := user.Sql.SelectProcedure(&datax, "GETMETATABLE_F", user.CompanyId, id)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	v := datax[0].View
	query := fmt.Sprintf(`
	DECLARE @advanced_filter varchar(max) = '%v'
	DECLARE @SQL NVARCHAR(MAX);
	DECLARE @filter_column NVARCHAR(MAX);
	DECLARE @js NVARCHAR(MAX)
	SET @filter_column = (SELECT dbo.NF_QUERYCOLUMNFILTER(@advanced_filter));
	SET @SQL = N'SET @json = (select * from %v WHERE' + @filter_column + 'FOR JSON PATH)';
	EXECUTE sp_executesql @SQL, N'@json NVARCHAR(MAX) OUTPUT', @json = @js OUTPUT
	select @js`, af, v)
	// PRODUCTOS_VIEW
	data, err := user.Sql.Queryx(query)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	var result string
	for data.Next() {
		var line string
		errScan := data.Scan(&line)
		if nil == errScan {
			result += line
		}
	}
	return httpmessage.Json(result)
}
