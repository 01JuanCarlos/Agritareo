package business

import (
	"context"
	"database/sql"
	"fmt"
	mssql2 "github.com/denisenkom/go-mssqldb"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/config"
	"ns-api/core/services/mssql"
	"ns-api/core/sts"
	"strings"
)

const (
	procedureMaintainerSave   = "MAINTAINER_INSERT"
	procedureMaintainerUpdate = "MAINTAINER_UPDATE"
	procedureMaintainerDelete = "MAINTAINER_DELETE"
	procedureConstraintsCheck = "CHECKCONSTRAINTS"
	procedureMaintainerList   = "MAINTAINER_LIST"
)

type maintainerRepository struct {
	sts.Repository
}

type saveResponseDetail struct {
	Id    string `json:"id"`
	Key   string `json:"key"`
	Index int    `json:"index"`
}

type saveResponse struct {
	HeaderId string               `json:"id,omitempty"`
	Details  []saveResponseDetail `json:"details,omitempty"`
}

type listResponse struct {
	TotalFiltered int64
	TotalRows     int64
	Data          interface{}
}

// Todo: Si hay procedimientos usarlo.

func (rp *maintainerRepository) parseSqlValue(value interface{}) (val string) {
	switch value.(type) {
	case string:
		val = fmt.Sprintf(`'%s'`, value)
	case nil:
		val = "NULL"
	case bool:
		var bitSetVar int8

		if value.(bool) {
			bitSetVar = 1
		}

		val = fmt.Sprintf(`%d`, bitSetVar)
	default:
		val = fmt.Sprintf(`%v`, value)
	}
	return
}

func (rp *maintainerRepository) parseSqlValues(values []interface{}) string {
	var _values []string

	for _, v := range values {
		_values = append(_values, rp.parseSqlValue(v))
	}
	return strings.Join(_values, ",")
}

func (rp *maintainerRepository) insertTable(tx *sql.Tx, name string, columns []string, values []interface{}) (string, error) {
	var id string
	ctx, _ := context.WithTimeout(context.Background(), config.MssqlMaxQueryDuration)
	result, err := tx.Prepare(fmt.Sprintf(`%s %s`, mssql.ParseProcedureName(procedureMaintainerSave), "$1,$2,$3"))

	if nil != err {
		return id, err
	}

	row := result.QueryRowContext(ctx, name, strings.Join(columns, ","), rp.parseSqlValues(values))

	if err := row.Scan(&id); nil != err {
		return id, err
	}

	return id, nil
}

func (rp *maintainerRepository) updateTable(tx *sql.Tx, name string, values []string, conditions []string) error {
	ctx, _ := context.WithTimeout(context.Background(), config.MssqlMaxQueryDuration)
	result, err := tx.Prepare(fmt.Sprintf(`%s %s`, mssql.ParseProcedureName(procedureMaintainerUpdate), "$1,$2,$3"))

	if nil != err {
		return err
	}

	_, err = result.QueryContext(ctx, name, strings.Join(values, ","), strings.Join(conditions, " AND "))

	return err
}

func (rp *maintainerRepository) deleteTable(tx *sql.Tx, name string, conditions []string) error {
	ctx, _ := context.WithTimeout(context.Background(), config.MssqlMaxQueryDuration)
	result, err := tx.Prepare(fmt.Sprintf(`%s %s`, mssql.ParseProcedureName(procedureMaintainerDelete), "$1,$2"))

	if nil != err {
		return err
	}

	_, err = result.QueryContext(ctx, name, strings.Join(conditions, " AND "))

	return err
}

func (rp *maintainerRepository) getColsAndValues(header headerMeta, data sts.Body) (headerColumns []string, headerValues []interface{}) {
	for _, v := range header.Columns {
		if !v.IsComputed && v.Name != header.PrimaryKey {
			if nil != data[v.Name] && "" != data[v.Name] {
				headerColumns = append(headerColumns, v.Name)
				headerValues = append(headerValues, data[v.Name])
			} else {
				if !(0 < len(v.Default)) {
					headerColumns = append(headerColumns, v.Name)
					headerValues = append(headerValues, nil)
				}
			}
		}
	}
	return
}

func (rp *maintainerRepository) getUpdateValues(header headerMeta, data sts.Body) (updateValues []string) {
	for _, c := range header.Columns {
		if !c.IsComputed && header.PrimaryKey != c.Name && nil != data[c.Name] {
			updateValues = append(updateValues, fmt.Sprintf(`%s=%v`, c.Name, rp.parseSqlValue(data[c.Name])))
		}
	}
	return
}

func (rp *maintainerRepository) Save(us *sts.Client, componentId string, data sts.Body) (*saveResponse, error) {
	meta, err := Component.GetMeta(us, componentId)
	// TODO: add alias field.
	logger.Debug(meta)
	if nil != err {
		return nil, err
	}

	if pName := fmt.Sprintf(`%s_%s_I`, config.MssqlPrefix, meta.Procedure); "" != meta.Procedure && Database.ProcedureExists(us, pName) {
		_, err := us.Sql.Exec(pName, us.CompanyId, utils.JsonString(data))
		if nil != err {
			return nil, err
		}
	}

	tx, err := us.Sql.Begin()

	if nil != err {
		return nil, err
	}

	var response saveResponse

	for _, v := range meta.Header.Columns {
		if config.CompanyIdKey == v.Name {
			data.Set(config.CompanyIdKey, us.CompanyId)
			break
		}
	}
	// start insert table
	headerColumns, headerValues := rp.getColsAndValues(meta.Header, data)
	id, err := rp.insertTable(tx, meta.Header.SourceName, headerColumns, headerValues)

	if nil != err {
		_ = tx.Rollback()
		return nil, err
	}

	// Append header ID
	response.HeaderId = id

	if 0 < len(meta.Details) {
		for _, h := range meta.Details {
			detail := data[strings.ToLower(h.SourceName)]
			if dd, ok := detail.([]interface{}); nil != detail && ok && 0 < len(dd) {
				for i, b := range dd {
					it, ok := b.(map[string]interface{})

					if !ok {
						continue
					}

					// start insert table
					it[h.ForeignKey] = id

					for _, v := range h.Columns {
						if config.CompanyIdKey == v.Name {
							it[config.CompanyIdKey] = us.CompanyId
							break
						}
					}

					headerColumns, headerValues := rp.getColsAndValues(h, it)
					did, err := rp.insertTable(tx, h.SourceName, headerColumns, headerValues)

					if nil != err {
						_ = tx.Rollback()
						return nil, err
					}

					// end insert table
					response.Details = append(response.Details, saveResponseDetail{
						Id:    did,
						Key:   strings.ToLower(h.SourceName),
						Index: i,
					})
				}

			}
		}
	}

	err = tx.Commit()
	return &response, err
}

func (rp *maintainerRepository) Update(us *sts.Client, id string, componentId string, data sts.Body) (interface{}, error) {
	meta, err := Component.GetMeta(us, componentId)

	if nil != err {
		return nil, err
	}

	if pName := fmt.Sprintf(`%s_%s_U`, config.MssqlPrefix, meta.Procedure); "" != meta.Procedure && Database.ProcedureExists(us, pName) {
		_, err := us.Sql.Exec(pName, us.CompanyId, utils.JsonString(data))
		if nil != err {
			return nil, err
		}
	}

	tx, err := us.Sql.Begin()

	if nil != err {
		return nil, err
	}

	var response saveResponse
	updateValues := rp.getUpdateValues(meta.Header, data)

	if 0 < len(updateValues) {

		condition := []string{
			fmt.Sprintf(`%s=%v`, meta.Header.PrimaryKey, rp.parseSqlValue(id)),
		}

		for _, v := range meta.Header.Columns {
			if config.CompanyIdKey == v.Name {
				condition = append(condition, fmt.Sprintf(`%s=%v`, config.CompanyIdKey, rp.parseSqlValue(us.CompanyId)))
				break
			}
		}

		err = rp.updateTable(tx, meta.Header.SourceName, updateValues, condition)

		if nil != err {
			_ = tx.Rollback()
			return nil, err
		}
	}

	if 0 < len(meta.Details) {
		var resDetails []saveResponseDetail
		for _, h := range meta.Details {
			rd, err := rp.UpdateDetails(us, tx, id, h, data)

			if nil != err {
				_ = tx.Rollback()
				return nil, err
			}
			resDetails = append(resDetails, *rd...)
		}
		response.Details = resDetails
	}

	err = tx.Commit()

	if 0 == len(response.Details) {
		return nil, err
	}

	return response, err
}

func (rp *maintainerRepository) UpdateDetails(us *sts.Client, tx *sql.Tx, id string, h headerMeta, data sts.Body) (*[]saveResponseDetail, error) {
	var responseDetails []saveResponseDetail

	detail := data[strings.ToLower(h.SourceName)]

	if dd, ok := detail.([]interface{}); nil != detail && ok && 0 < len(dd) {
		for i, b := range dd {
			it, ok := b.(map[string]interface{})

			if !ok {
				continue
			}

			did := it[h.PrimaryKey]

			if nil == did && 0 < len(it) { // Insert row
				it[h.ForeignKey] = id // Add header primary key

				for _, v := range h.Columns {
					if config.CompanyIdKey == v.Name {
						it[config.CompanyIdKey] = us.CompanyId
						break
					}
				}

				headerColumns, headerValues := rp.getColsAndValues(h, it)
				nid, err := rp.insertTable(tx, h.SourceName, headerColumns, headerValues)

				responseDetails = append(responseDetails, saveResponseDetail{
					Id:    nid,
					Key:   strings.ToLower(h.SourceName),
					Index: i,
				})

				if nil != err {
					return nil, err
				}

				continue
			}

			if nil != did && 1 == len(it) { // Delete row
				condition := []string{
					fmt.Sprintf(`%s=%v`, h.PrimaryKey, rp.parseSqlValue(did)),
					fmt.Sprintf(`%s=%v`, h.ForeignKey, rp.parseSqlValue(id)),
				}

				for _, v := range h.Columns {
					if config.CompanyIdKey == v.Name {
						condition = append(condition, fmt.Sprintf(`%s=%v`, config.CompanyIdKey, rp.parseSqlValue(us.CompanyId)))
						break
					}
				}

				err := rp.deleteTable(tx, h.SourceName, condition)

				if nil != err {
					return nil, err
				}
				continue
			}

			if nil != did && 1 < len(it) { // Update row
				delete(it, h.PrimaryKey)

				updateValues := rp.getUpdateValues(h, it)

				if 0 < len(updateValues) {
					condition := []string{
						fmt.Sprintf(`%s=%v`, h.PrimaryKey, rp.parseSqlValue(did)),
						fmt.Sprintf(`%s=%v`, h.ForeignKey, rp.parseSqlValue(id)),
					}

					for _, v := range h.Columns {
						if config.CompanyIdKey == v.Name {
							condition = append(condition, fmt.Sprintf(`%s=%v`, config.CompanyIdKey, rp.parseSqlValue(us.CompanyId)))
							break
						}
					}

					err := rp.updateTable(tx, h.SourceName, updateValues, condition)

					if nil != err {
						return nil, err
					}
				}

				if 0 < len(h.Details) {
					for _, h2 := range h.Details {
						rd, err := rp.UpdateDetails(us, tx, fmt.Sprintf(`%v`, did), h2, it)

						if nil != err {
							return nil, err
						}

						responseDetails = append(responseDetails, *rd...)
					}
				}

			}
		}
	}

	return &responseDetails, nil
}

func (rp *maintainerRepository) Replace() {}

func (rp *maintainerRepository) Delete(us *sts.Client, id string, componentId string) (interface{}, error) {
	meta, err := Component.GetMeta(us, componentId)

	if nil != err {
		return nil, err
	}

	tx, err := us.Sql.Begin()

	if 0 < len(meta.Details) {
		for _, d := range meta.Details {

			condition := []string{
				fmt.Sprintf(`%s=%s`, d.ForeignKey, rp.parseSqlValue(id)),
			}

			for _, v := range d.Columns {
				if config.CompanyIdKey == v.Name {
					condition = append(condition, fmt.Sprintf(`%s=%v`, config.CompanyIdKey, rp.parseSqlValue(us.CompanyId)))
					break
				}
			}

			err = rp.deleteTable(tx, d.SourceName, condition)

			if nil != err {
				_ = tx.Rollback()

				if 547 == err.(mssql2.Error).Number {

				}

				return nil, err
			}
		}

	}

	condition := []string{
		fmt.Sprintf(`%s=%s`, meta.Header.PrimaryKey, rp.parseSqlValue(id)),
	}

	for _, v := range meta.Header.Columns {
		if config.CompanyIdKey == v.Name {
			condition = append(condition, fmt.Sprintf(`%s=%v`, config.CompanyIdKey, rp.parseSqlValue(us.CompanyId)))
			break
		}
	}

	err = rp.deleteTable(tx, meta.Header.SourceName, condition)

	if nil != err {
		_ = tx.Rollback()

		if 547 == err.(mssql2.Error).Number {

		}

		return nil, err
	}

	_ = tx.Commit()

	return nil, nil
}

func (rp *maintainerRepository) List(us *sts.Client, componentId string, page, size int, sort, search, filter string) (*listResponse, error) {
	meta, err := Component.GetMeta(us, componentId)

	if nil != err {
		return nil, err
	}

	//@idempresa varchar(3), --'106'
	//@columns varchar(max),-- = 'idempresa, id, codigo, nombre, tipo_grupo, idestado',
	//@table varchar(250), -- = 'tmgrupo',
	//@size smallint = 20,
	//@page smallint = 1,
	//@search nvarchar(max) = '',
	//@order varchar(max) = '',
	//@advanced_filter varchar(max) = '',
	//@default_filter varchar(max)-- = 'codigo LIKE @search+''%'' OR nombre LIKE ''%''+@search+''%'''

	if "" != meta.Procedure {

		if "" == sort {
			sort = "{}"
		}

		if "" == filter {
			filter = "{}"
		}

		result, err := us.Sql.Page(
			fmt.Sprintf(`%v_L`, meta.Procedure),
			us.CompanyId,
			size,
			page,
			search,
			sort,
			filter,
		)

		if nil != err {
			return nil, err
		}

		return &listResponse{
			TotalFiltered: result.TotalFiltered,
			TotalRows:     result.TotalRows,
			Data:          result.Data,
		}, nil

	} else {
		var companyId string
		var filters []string
		var project []string

		for _, v := range meta.Filters {
			filters = append(filters, v.Name)
		}

		for _, v := range meta.Columns {
			if config.CompanyIdKey == v.Name {
				companyId = us.CompanyId
			}

			name := v.Name

			if 0 < len(v.Alias) {
				// TODO: Renombre segun motor de base de datos
				name += fmt.Sprintf(` AS [%s]`, v.Alias)
			}

			project = append(project, name)

		}

		if !(0 < len(project)) {
			project = append(project, "*")
		}

		result, err := us.Sql.Page(
			procedureMaintainerList,
			companyId,
			strings.Join(project, ","), // CAST((transaction_uid) AS VARCHAR(36)) as
			meta.SourceName,
			size,
			page,
			search,
			sort,
			filter,
			strings.Join(filters, ","),
		)

		if nil != err {
			return nil, err
		}

		return &listResponse{
			TotalFiltered: result.TotalFiltered,
			TotalRows:     result.TotalRows,
			Data:          result.Data,
		}, nil
	}

	//result, err := us.Sql.Exec(
	//	procedureMaintainerList,
	//	us.CompanyId,
	//	"id, codigo, nombre, idestado AS [status], fechacreacion, CAST((transaction_uid) AS VARCHAR(36)) as transaction_uid",
	//	meta.SourceName,
	//	size,
	//	page,
	//	search,
	//	"",
	//	"",
	//	" nombre LIKE @search OR codigo LIKE @search",
	//)
}

var Maintainer = &maintainerRepository{}
