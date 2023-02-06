package controllers

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"ns-api/common/constants"
	"ns-api/common/utils"
	"ns-api/config"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/core/validator"
	"ns-api/locale"
	"strings"
	"time"
)

// --- user
type userBody struct {
	Date           string `json:"date"`
	ProfileID      int    `json:"idperfil" validate:"required,empty"`
	Name           string `json:"nombre"  validate:"required,empty"`
	Username       string `json:"usuario" validate:"required,empty"`
	Password       string `json:"clave,omitempty"`
	TransactionUID string `json:"transaction_uid,omitempty"`
}

// --- psw
type Password struct {
	New string `json:"new" validate:"required"`
	Old string `json:"old" validate:"required"`
}

func CreatePassword() string {
	rand.Seed(time.Now().UnixNano())
	chars := []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz" + "1234567890")
	size := 6
	var b strings.Builder
	for i := 0; i < size; i++ {
		b.WriteRune(chars[rand.Intn(len(chars))])
	}
	return b.String()
}

func PostUser(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body userBody
	// fixme: revisar id
	//raw := utils.ParseBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}
	randomPassword := CreatePassword()
	body.Password = utils.PasswordEncrypt(randomPassword)
	body.TransactionUID = r.Header.Get(config.TransactionHeader)
	_, err := user.Sql.ExecJson(constants.PInsertUser, user.CompanyId, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	// fixme otro registro sin id -> log
	return httpmessage.Json(
		fmt.Sprintf(`{"pwkey":"%s"}`, randomPassword),
	)
}

func PutUser(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	var body userBody
	raw := utils.ParseBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	_, err := user.Sql.ExecJson(constants.PUpdateUser, user.CompanyId, id, utils.JsonString(body))
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Log(raw)
}

func PatchUser(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	_, err := user.Sql.ExecJson(constants.PPatchUser, user.CompanyId, id)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

func PatchUserPwd(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body Password
	_ = utils.ParseBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		return httpmessage.Error(locale.ValidationError, errors)
	}

	COPwd := utils.PasswordEncrypt(body.Old)
	CNPwd := utils.PasswordEncrypt(body.New)
	result, err := user.Sql.ExecJson(constants.PPatchPwd, user.UserId, COPwd, CNPwd)
	if err != nil || result != "" {
		fmt.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

func DeleteUser(user *sts.Client, r *http.Request)  httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	_, err := user.Sql.ExecJson("USUARIO_D", user.CompanyId, id)
	if err != nil {
	log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}
