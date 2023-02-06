package business

import (
	"ns-api/common/utils"
	"ns-api/core/services/session"
)

type UserValidated struct {
	UserId     int64            `json:"idusuario"`
	Status     bool             `json:"habilitado"`
	UserName   string           `json:"usuario"`
	Privileges []session.Detail `json:"privileges"`
}

func isExpiredSession() {

}

func encryptPassword(password string) string {
	return utils.PasswordEncrypt(password)
}

func createUserAuthSession() {

}

func createUserAuthToken() {

}

func ValidateUserAuth() bool {
	return false
}

func GetUserAuth(corporationId, companyId, username, password string) {
	//db, _err := mssql.Mssql.GetConnection(corporationId)
	//
	//if nil != _err {
	//	err = core.NewError(locale.SomethingBadHappened, err)
	//	return
	//}
	//
	//password = encryptPassword(password)
	//
	//result, _err := db.ExecJson(constants.PCheckLogin, companyId, username, password)
	//
	//if nil != _err || 0 == len(result) {
	//	core.NewError(locale.InvalidLogIn)
	//	return
	//}
	//
	//var userResult loginResult
	//_ = json.Unmarshal([]byte(result), &userResult)
	//
	//return nil
}
