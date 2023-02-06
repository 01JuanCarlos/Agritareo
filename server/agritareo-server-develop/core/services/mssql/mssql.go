package mssql

import (
	"errors"
	_ "github.com/denisenkom/go-mssqldb"
	"github.com/jmoiron/sqlx"
	errors2 "ns-api/core/errors"
	"ns-api/modules/log"
	"time"
)

const PING_INTERVAL = 30 // Segundos

var (
	ConflictedError = errors2.NewError(547)
)

type DatabaseConnection struct {
	Id               string
	Name             string
	Driver           string
	StringConnection string
	connection       *sqlx.DB
	lastPing         int64
}

func (conn *DatabaseConnection) IsConnected() bool {
	var pingFailed bool
	if nil != conn.connection && (time.Now().Unix()-conn.lastPing > PING_INTERVAL) {
		err := conn.connection.Ping()
		conn.lastPing = time.Now().Unix()
		pingFailed = nil != err
	}
	return nil != conn.connection && !pingFailed
}

func (conn *DatabaseConnection) SetConnection(_conn *sqlx.DB) {
	conn.connection = _conn
}

func (conn *DatabaseConnection) Connect() (*DatabaseConnection, error) {
	db, err := sqlx.Open(conn.Driver, conn.StringConnection)
	if nil != err {
		log.Errorf(`mssql[Connect]: Connection [%s] error. %s`, conn.Id, err.Error())
		return nil, err
	}

	db.SetMaxOpenConns(0)  // Conexiones abiertas
	db.SetMaxIdleConns(10) // Conexiones inactivas
	db.SetConnMaxLifetime(time.Hour * 24)
	conn.SetConnection(db)
	return conn, nil
}

func (conn *DatabaseConnection) Close() {
	if nil != conn.connection {
		_ = conn.connection.Close()
	}
}

type Mssql struct {
	connections map[string]*DatabaseConnection
}

var DB *Mssql

func init() {
	DB = newMssql()
}

func newMssql() *Mssql {
	return &Mssql{
		connections: make(map[string]*DatabaseConnection),
	}
}

func (db *Mssql) Exists(id string) bool {
	_, ok := db.connections[id]
	return ok
}

func (db *Mssql) AddConnection(conn *DatabaseConnection) {
	if nil != conn && !db.Exists(conn.Id) {
		db.connections[conn.Id] = conn
	}
}

func (db *Mssql) GetConnection(id string) (*DatabaseConnection, error) {
	//fmt.Println(db.connections)
	conn, ok := db.connections[id]
	if !ok {
		return nil, errors.New("mssql: connection id=[" + id + "] does not exist.")
	}
	return conn, nil
}

func (db *Mssql) ConnectIfNotExists(id string) (*DatabaseConnection, error) {
	conn, err := db.GetConnection(id)

	if nil != err {
		return nil, err
	}

	if !conn.IsConnected() {
		_, err = conn.Connect()
		if nil != err {
			return nil, err
		}
	}

	return conn, nil
}
