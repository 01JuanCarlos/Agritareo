package middlewares

import (
	"github.com/gorilla/context"
	"net/http"
	"ns-api/config"
	"ns-api/core/services/mongodb"
	"ns-api/core/services/mssql"
	"ns-api/core/sts"
	"ns-api/modules/log"
)

func DbConnectionMiddleware(skipServices *[]string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			url := r.URL.Path

			// Exclude ws server
			if up := r.Header.Get("Upgrade"); up == "websocket" {
				next.ServeHTTP(w, r)
				return
			}

			// SkipService exclude paths
			for _, path := range *skipServices {
				if url == path {
					next.ServeHTTP(w, r)
					return
				}
			}

			connectionId := r.Header.Get(config.CorporationIdHeader)
			JwtSkipValidation := context.Get(r, config.JwtSkipValidation)

			if nil != JwtSkipValidation && JwtSkipValidation.(bool) && 0 == len(connectionId) {
				next.ServeHTTP(w, r)
				return
			}

			payload := context.Get(r, config.PayloadTokenKey)

			if nil != payload {
				connectionId = payload.(*sts.Client).ConnectionId
			}

			if 0 == len(connectionId) {
				log.Error("DbConnectionMiddleware: Unable to retrieve connection ID for this request")
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			_, err := mssql.DB.ConnectIfNotExists(connectionId)

			if nil != err {
				log.Error("DbConnectionMiddleware[mssql]: Could not connect to the database, " + err.Error())
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			_, err = mongodb.DB.ConnectIfNotExists(connectionId)

			if nil != err {
				log.Warn("DbConnectionMiddleware[mongo]: Could not connect to the database, " + err.Error())
				if config.StrictNoSqlVerification {
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
			}

			context.Set(r, config.PayloadConnectionId, connectionId)
			next.ServeHTTP(w, r)
		})
	}
}
