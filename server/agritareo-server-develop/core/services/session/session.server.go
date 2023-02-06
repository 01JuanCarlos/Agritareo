package session

import (
	"encoding/gob"
	"github.com/gorilla/sessions"
	"net/http"
	"ns-api/config"
	"path/filepath"
)

type Detail struct {
	DPrivileges string
	Cid         string
}

type UserSession struct {
	UserId        int
	Username      string
	Authenticated bool
	Privileges    []Detail //todo: replace
}

var SessionStore *sessions.FilesystemStore

func init() {
	//securecookie.GenerateRandomKey(64)
	authKeyOne := []byte{
		125, 121, 110, 230, 44, 66, 61, 176, 155, 65, 34,
		80, 232, 187, 30, 199, 17, 34, 115, 69, 52, 234,
		162, 145, 104, 147, 190, 67, 158, 56, 113, 202, 107,
		113, 226, 167, 144, 43, 128, 179, 70, 162, 142, 216, 204,
		182, 103, 194, 159, 95, 147, 115, 183, 92, 44, 132, 168,
		255, 205, 178, 218, 247, 230, 232,
	}
	//securecookie.GenerateRandomKey(32)
	encryptionKeyOne := []byte{
		38, 109, 108, 238, 232, 172, 4, 205, 146,
		180, 14, 45, 223, 233, 63, 205, 218, 100,
		77, 68, 76, 133, 241, 131, 23, 99, 14, 226,
		235, 113, 69, 163,
	}

	SessionStore = sessions.NewFilesystemStore(
		filepath.Join(config.TemporalDirectory, config.Conf.Api.SessionDirectory),
		authKeyOne,
		encryptionKeyOne,
	)

	SessionStore.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7,
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	}
	SessionStore.MaxLength(512000) // 512KB
	gob.Register(UserSession{})
}
