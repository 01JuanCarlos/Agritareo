package constants

import "fmt"

func Exist(table string, id int) (value string) {
	value = fmt.Sprintf(`
	IF NOT EXISTS (SELECT id FROM %v WITH(NOLOCK) WHERE id = %v)
		THROW 51003, 'No existe ningun registro con este identificador', 15;
`, table, id)
	return
}

func Delete(table string, id int) (value string) {
	value = fmt.Sprintf(`Delete from %v where id = %v;`, table, id)
	return
}