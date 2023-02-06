package business

import (
	"ns-api/core/sts"
)

type databaseRepository struct {
	sts.Repository
}

type tableSchema struct {
	Name string `db:"name" json:"name"`
}

type procedureSchema struct {
	Name string `db:"name" json:"name"`
}

func (dbr *databaseRepository) ProcedureExists(us *sts.Client, procedureName string) bool {
	var total int

	row := us.Sql.QueryRowContext("SELECT COUNT(*) as total FROM INFORMATION_SCHEMA.ROUTINES p WHERE p.ROUTINE_NAME = $1", procedureName)

	_ = row.Scan(&total)

	return total > 0
}

func (dbr *databaseRepository) GetTables(us *sts.Client) ([]tableSchema, error) {
	var tables []tableSchema

	err := us.Sql.Select(&tables, `SELECT TABLE_NAME as [name]  FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`)

	if nil != err {
		return tables, err
	}

	return tables, nil
}

func (dbr *databaseRepository) GetProcedures(us *sts.Client) ([]procedureSchema, error) {
	var procedures []procedureSchema
	err := us.Sql.Select(&procedures, `SELECT ROUTINE_NAME as [name] FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE'`)

	if nil != err {
		return procedures, err
	}

	return procedures, nil
}

// Export name declaration
var Database = &databaseRepository{}
