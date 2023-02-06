package middlewares

import (
	"encoding/json"
	"github.com/gorilla/context"
	"net/http"
	"ns-api/config"
	session2 "ns-api/core/services/session"
	"ns-api/core/sts"
	"ns-api/modules/log"
)

func PrivilegesMiddleware(excludePaths *[]string, privi *[]string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			url := r.URL.Path
			// Jwt exclude paths
			for _, path := range *excludePaths {
				if url == path {
					next.ServeHTTP(w, r)
					return
				}
			}
			for _ , path := range *privi {
				if url == path {
					next.ServeHTTP(w, r)
					return
				}
			}

			component := r.Header.Get(config.ComponentIdHeader)
			payload := context.Get(r, config.PayloadTokenKey)
			user := payload.(*sts.Client)
			if component != "" {
				session, err := session2.SessionStore.Get(r, config.SessionCookieName)
				//fmt.Println(session.Values["user"])
				if err != nil || nil == session.Values["user"] {
					//if err != nil {
					//	log.Error(" fallado obteniendo la sesion: ", err.Error())
					//	w.WriteHeader(http.StatusInternalServerError)
					//	return
					//}
					result, err := user.Sql.ExecJson("USERPRIVILEGES_F", user.CompanyId, user.UserId)
					if err != nil {
						log.Error(" fallado obteniendo los privilegios de la sesion: ", err.Error())
						w.WriteHeader(http.StatusInternalServerError)
						return
					}
					var privileges []session2.Detail
					_ = json.Unmarshal([]byte(result), &privileges)
					renewSession := session2.UserSession{
						Username:      user.UserName,
						Authenticated: true,
						Privileges:    privileges,
					}
					// fmt.Println(renewSession)
					session.Values["user"] = renewSession
					err = session.Save(r, w)
					if err != nil {
						log.Debug(err)
						return
					}
				}
				privileges := session.Values["user"].(session2.UserSession)
				for _, comp := range privileges.Privileges {
					if component == comp.Cid {
						next.ServeHTTP(w, r)
						return
					}
				}
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			w.WriteHeader(http.StatusUnauthorized)
			//next.ServeHTTP(w, r)
		})
	}
}
