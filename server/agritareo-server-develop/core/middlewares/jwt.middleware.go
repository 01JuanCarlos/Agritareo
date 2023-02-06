package middlewares

import (
	"crypto/rsa"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/context"
	"net/http"
	"ns-api/config"
	"ns-api/core/sts"
	"ns-api/core/util"
	"ns-api/modules/log"
	"strings"
	"time"
)

func JwtMiddleware(excludePaths *[]string, publicKey *rsa.PublicKey) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			context.Set(r, config.ReceivedTimeKey, time.Now())

			url := r.URL.Path
			// Jwt exclude paths
			for _, path := range *excludePaths {
				if url == path {
					context.Set(r, config.JwtSkipValidation, true)
					next.ServeHTTP(w, r)
					return
				}
			}

			// Get token string from header
			tokenHeader := r.Header.Get(config.AuthorizationHeader)

			if "" == tokenHeader {
				log.Error("JwtMiddleware: Error missing token")
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			splitToken := strings.Split(tokenHeader, " ")

			if 2 != len(splitToken) {
				log.Error("JwtMiddleware: Invalid/Malformed auth token")
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			tokenType := splitToken[0] // Basic, Bearer

			if config.AuthorizationTokenType != tokenType {
				log.Error("JwtMiddleware: Invalid token type")
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			authToken := splitToken[1]
			payload := &sts.Client{}
			token, err := jwt.ParseWithClaims(authToken, payload, func(token *jwt.Token) (interface{}, error) {
				return publicKey, nil
			})

			if err != nil {
				log.Error("JwtMiddleware: Malformed authentication token ", err.Error())
				w.WriteHeader(http.StatusForbidden)
				return
			}

			if !token.Valid {
				log.Error("JwtMiddleware: Token is not valid")
				w.WriteHeader(http.StatusForbidden)
				return
			}

			if payload.Hash != util.CheckSum(fmt.Sprintf(`%d+%s+%s`, payload.UserId, payload.CompanyId, payload.CorporationId)) {
				log.Error("JwtMiddleware: Hash is not valid: %s", payload.Hash)
				w.WriteHeader(http.StatusForbidden)
				return
			}

			payload.IsAuth = true
			payload.SetConnectionId(payload.CorporationId)
			context.Set(r, config.PayloadTokenKey, token.Claims)
			next.ServeHTTP(w, r)
		})
	}
}
