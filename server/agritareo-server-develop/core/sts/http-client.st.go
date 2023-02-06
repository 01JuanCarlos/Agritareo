package sts

import (
	"github.com/dgrijalva/jwt-go"
	"ns-api/core/services/mongodb"
	"ns-api/core/services/mssql"
)

type Client struct {
	CompanyId     string                    `json:"company_id"`
	CorporationId string                    `json:"corp_id"`
	ConnectionId  string                    `json:"-"`
	UserId        int64                     `json:"user_id"`
	UserName      string                    `json:"user_name"`
	Hash          string                    `json:"hash"`
	Sql           *mssql.DatabaseConnection `json:"-"`
	NoSql         *mongodb.MongoConnection  `json:"-"`
	IsAuth        bool                      `json:"-"`
	jwt.StandardClaims
}

func (cl *Client) SetSqlConnection(connection *mssql.DatabaseConnection) {
	cl.Sql = connection
}

func (cl *Client) SetNoSqlConnection(connection *mongodb.MongoConnection) {
	cl.NoSql = connection
}

func (cl *Client) SetConnectionId(connectionId string) {
	cl.ConnectionId = connectionId
}

func (cl *Client) HasConnectionId() bool {
	return len(cl.ConnectionId) > 0
}

func (cl *Client) HasSqlConnection() bool {
	return nil != cl.Sql
}

func (cl *Client) HasNoSqlConnection() bool {
	return nil != cl.NoSql
}
