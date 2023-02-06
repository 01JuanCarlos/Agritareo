package mongodb

import (
	"context"
	"errors"
	"fmt"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"time"
)

const PingInterval = 50 // Segundos

var bulkQueue [][]mongo.WriteModel

type MongoConnection struct {
	Id               string
	Name             string
	Driver           string
	Database         string
	StringConnection string
	connection       *mongo.Client
	lastPing         int64
}

func (conn *MongoConnection) IsConnected() bool {
	var pingFailed bool
	if nil != conn.connection && (time.Now().Unix()-conn.lastPing > PingInterval) {
		ctx, _ := context.WithTimeout(context.Background(), 2*time.Second)
		err := conn.connection.Ping(ctx, readpref.Primary())
		conn.lastPing = time.Now().Unix()
		pingFailed = nil != err
	}
	return nil != conn.connection && !pingFailed
}

func (conn *MongoConnection) SetConnection(_conn *mongo.Client) {
	conn.connection = _conn
}

func (conn *MongoConnection) Connect() (*MongoConnection, error) {

	conn.StringConnection = conn.StringConnection + `?authSource=admin`

	clientOptions := options.Client().ApplyURI(conn.StringConnection)
	_conn, err := mongo.Connect(context.TODO(), clientOptions)

	if nil != err {
		return nil, err
	}

	conn.SetConnection(_conn)
	return conn, nil
}

func (conn *MongoConnection) _connection(id string) *mongo.Database {
	return conn.connection.Database(fmt.Sprintf(`%s_%s`, conn.Database, id))
}

func (conn *MongoConnection) Collection(connectionId, name string) *mongo.Collection {
	return conn._connection(connectionId).Collection(name)
}

type MongoDB struct {
	connections map[string]*MongoConnection
}

var DB *MongoDB

func init() {
	DB = newMongoDB()
}

func newMongoDB() *MongoDB {
	return &MongoDB{
		connections: make(map[string]*MongoConnection),
	}
}

func (db *MongoDB) AddConnection(conn *MongoConnection) {
	if nil != conn && !db.Exists(conn.Id) {
		db.connections[conn.Id] = conn
	}
}

func (db *MongoDB) Exists(id string) bool {
	_, ok := db.connections[id]
	return ok
}

func (db *MongoDB) GetConnection(id string) (*MongoConnection, error) {
	conn, ok := db.connections[id]
	if !ok {
		return nil, errors.New("mongodb: connection id=[" + id + "] does not exist.")
	}
	return conn, nil
}

func (db *MongoDB) ConnectIfNotExists(id string) (*MongoConnection, error) {
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
