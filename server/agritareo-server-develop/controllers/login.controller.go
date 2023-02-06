package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/config"
	"ns-api/core/server/httpmessage"
	"ns-api/core/services/mssql"
	session2 "ns-api/core/services/session"
	"ns-api/core/sts"
	"ns-api/core/util"
	"ns-api/core/validator"
	"ns-api/locale"
	"time"

	"github.com/dgrijalva/jwt-go"
)

type LoginBody struct {
	Password  string `json:"password" validate:"required,notBlank"`
	Username  string `json:"username" validate:"required,notBlank"`
	CompanyId string `json:"idcompany" validate:"required,notBlank"`
	CorpId    string `json:"idcorp" validate:"required,notBlank"`
}

type loginResult struct {
	UserId     int64             `json:"idusuario"`
	Status     bool              `json:"habilitado"`
	UserName   string            `json:"usuario"`
	Privileges []session2.Detail `json:"privileges"`
}
type loginResultApp struct {
	UserId      int64             `json:"idusuario"`
	Status      bool              `json:"habilitado"`
	EvaluadorId int64             `json:"idevaluador"`
	UserName    string            `json:"usuario"`
	Name        string            `json:"nombre_completo"`
	Privileges  []session2.Detail `json:"privileges"`
}

type loginResponse struct {
	UserId    int64  `json:"userId"`
	CompanyId string `json:"companyId"`
	CorpId    string `json:"corpId"`
	Token     string `json:"token"`
	Hash      string `json:"hash"`
	Expire    int64  `json:"expire"`
}

type loginResponseApp struct {
	UserId      int64  `json:"userId"`
	EvaluadorId int64  `json:"idevaluador"`
	CompanyId   string `json:"companyId"`
	CorpId      string `json:"corpId"`
	Name        string `json:"name"`
	Token       string `json:"token"`
	Hash        string `json:"hash"`
	Expire      int64  `json:"expire"`
}

func PostLogin(r *http.Request, w http.ResponseWriter) (response httpmessage.HttpMessage, err error) {
	var body LoginBody
	var db *mssql.DatabaseConnection

	_ = util.GetBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		response = httpmessage.Error(locale.ValidationError, errors)
		return
	}

	db, err = mssql.DB.ConnectIfNotExists(body.CorpId)

	if nil != err {
		logger.Errorf("Login connection Error: %s", err.Error())
		response = httpmessage.Error(err)
		return
	}

	session, err := session2.SessionStore.Get(r, config.SessionCookieName)
	password := utils.PasswordEncrypt(body.Password)

	//if err := business.ValidateUser(body.CorpId, body.CompanyId, body.Username, body.Password); nil != err {
	//	response = httpmessage.Error(err)
	//}

	result, err := db.ExecJson(
		"CHECKLOGIN",
		body.CompanyId,
		body.Username,
		password,
	)
	if err != nil || result == "" {
		err = nil
		response = httpmessage.Error(locale.InvalidLogIn)
		return
	}
	var userResult loginResult
	_ = json.Unmarshal([]byte(result), &userResult)
	expireAt := time.Now().Add(config.ExpireTokenTime)
	hash := util.CheckSum(fmt.Sprintf(`%d+%s+%s`, userResult.UserId, body.CompanyId, body.CorpId))

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, &sts.Client{
		CompanyId:     body.CompanyId,
		CorporationId: body.CorpId,
		UserId:        userResult.UserId,
		UserName:      userResult.UserName,
		Hash:          hash,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expireAt.Unix(),
		},
	})

	tokenKey, err := token.SignedString(config.RSAPrivateKey)

	if err != nil {
		return
	}

	userSession := &session2.UserSession{
		Username:      userResult.UserName,
		Authenticated: true,
		Privileges:    userResult.Privileges,
	}
	session.Values["user"] = userSession
	err = session.Save(r, w)

	if err != nil {
		// http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     config.TokenCookieName,
		Value:    tokenKey,
		Expires:  expireAt,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Secure:   true,
		Path:     "/",
	})

	response = httpmessage.Send(&loginResponse{
		UserId: userResult.UserId,

		CompanyId: body.CompanyId,
		CorpId:    body.CorpId,
		Token:     tokenKey,
		Hash:      hash,
		Expire:    expireAt.Unix(),
	})

	return
}

func PostLoginApp(r *http.Request, w http.ResponseWriter) (response httpmessage.HttpMessage, err error) {
	var body LoginBody
	var db *mssql.DatabaseConnection

	_ = util.GetBody(r, &body)

	if valid, errors := validator.Validate(body); !valid {
		response = httpmessage.Error(locale.ValidationError, errors)
		return
	}

	db, err = mssql.DB.ConnectIfNotExists(body.CorpId)

	if nil != err {
		logger.Errorf("Login connection Error: %s", err.Error())
		response = httpmessage.Error(err)
		return
	}

	session, err := session2.SessionStore.Get(r, config.SessionCookieName)
	password := utils.PasswordEncrypt(body.Password)

	//if err := business.ValidateUser(body.CorpId, body.CompanyId, body.Username, body.Password); nil != err {
	//	response = httpmessage.Error(err)
	//}

	result, err := db.ExecJson(
		"CHECKLOGIN_APP",
		body.CompanyId,
		body.Username,
		password,
	)
	if err != nil || result == "" {
		err = nil
		response = httpmessage.Error(locale.InvalidLogIn)
		return
	}
	var userResult loginResultApp
	_ = json.Unmarshal([]byte(result), &userResult)
	expireAt := time.Now().Add(time.Hour * 1000000)
	hash := util.CheckSum(fmt.Sprintf(`%d+%s+%s`, userResult.UserId, body.CompanyId, body.CorpId))

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, &sts.Client{
		CompanyId:     body.CompanyId,
		CorporationId: body.CorpId,
		UserId:        userResult.UserId,
		UserName:      userResult.UserName,
		Hash:          hash,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expireAt.Unix(),
		},
	})

	tokenKey, err := token.SignedString(config.RSAPrivateKey)

	if err != nil {
		return
	}

	userSession := &session2.UserSession{
		Username:      userResult.UserName,
		Authenticated: true,
		Privileges:    userResult.Privileges,
	}
	session.Values["user"] = userSession
	err = session.Save(r, w)

	if err != nil {
		// http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     config.TokenCookieName,
		Value:    tokenKey,
		Expires:  expireAt,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Secure:   true,
		Path:     "/",
	})

	response = httpmessage.Send(&loginResponseApp{
		UserId:      userResult.UserId,
		CompanyId:   body.CompanyId,
		CorpId:      body.CorpId,
		EvaluadorId: userResult.EvaluadorId,
		Name:        userResult.Name,
		Token:       tokenKey,
		Hash:        hash,
		Expire:      expireAt.Unix(),
	})

	return
}

// todo: Reestablecer la cookie
func PostRenewLoginSession(user *sts.Client) httpmessage.HttpMessage {
	currentTime := time.Now()
	futureTime := time.Unix(user.ExpiresAt, 0)
	diffTime := futureTime.Sub(currentTime).Hours()
	minTime := (time.Hour / 2).Hours()

	if diffTime < minTime {
		expireAt := time.Now().Add(config.ExpireTokenTime)

		token := jwt.NewWithClaims(jwt.SigningMethodRS256, &sts.Client{
			CompanyId:     user.CompanyId,
			CorporationId: user.CorporationId,
			UserId:        user.UserId,
			Hash:          user.Hash,
			StandardClaims: jwt.StandardClaims{
				ExpiresAt: expireAt.Unix(),
			},
		})

		tokenKey, err := token.SignedString(config.RSAPrivateKey)

		if err == nil {
			return httpmessage.Send(&loginResponse{
				UserId:    user.UserId,
				CompanyId: user.CompanyId,
				CorpId:    user.CorporationId,
				Token:     tokenKey,
				Hash:      user.Hash,
				Expire:    expireAt.Unix(),
			})
		}

	}
	return httpmessage.Error(locale.InvalidSession)

}

func Logout(r *http.Request, w http.ResponseWriter) {
	expire := time.Now().Add(-15 * 24 * time.Hour)

	http.SetCookie(w, &http.Cookie{
		Name:     config.TokenCookieName,
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
		Expires:  expire,
		Secure:   true,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     config.SessionCookieName,
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
		Expires:  expire,
		Secure:   true,
	})
	// Session Close
	session, err := session2.SessionStore.Get(r, config.SessionCookieName)
	if err != nil {
		logger.Debug(err)
		return
	}
	session.Options.MaxAge = -1
	session.Values["user"] = &session2.UserSession{}
	err = session.Save(r, w)
	if err != nil {
		logger.Debug(err)
		return
	}
}
