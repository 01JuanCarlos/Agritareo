package mongodb

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

func (conn *MongoConnection) Aggregate(collection string, pipeline mongo.Pipeline) (*mongo.Cursor, error) {
	model := conn.Collection(conn.Id, collection)
	ctx, _ := context.WithTimeout(context.Background(), 40*time.Second)
	return model.Aggregate(ctx, pipeline)
}

func (conn *MongoConnection) Aggregate2(collection string, pipeline mongo.Pipeline) ([]bson.M, error) {
	model := conn.Collection(conn.Id, collection)
	ctx, _ := context.WithTimeout(context.Background(), 40*time.Second)
	cursor, err := model.Aggregate(ctx, pipeline)
	if nil != err {
		return nil, err
	}

	result := make([]bson.M, 0)

	for cursor.Next(ctx) {
		var row bson.M
		err := cursor.Decode(&row)
		if nil == err {
			result = append(result, row)
		}
	}

	return result, nil
}

func (conn *MongoConnection) Save(collection string, documents ...interface{}) (*mongo.InsertManyResult, error) {
	model := conn.Collection(conn.Id, collection)
	ctx, _ := context.WithTimeout(context.Background(), 40*time.Second)
	return model.InsertMany(ctx, documents)
}

func (conn *MongoConnection) Upsert(collection string, search, documents interface{}) (*mongo.UpdateResult, error) {
	model := conn.Collection(conn.Id, collection)
	ctx, _ := context.WithTimeout(context.Background(), 40*time.Second)
	return model.UpdateOne(ctx, search, documents, options.Update().SetUpsert(true))
}

func (conn *MongoConnection) SaveQueue(collection string, documents ...interface{}) error {
	model := conn.Collection(conn.Id, collection)
	var operations []mongo.WriteModel

	for _, doc := range documents {
		operation := mongo.NewInsertOneModel()
		operation.SetDocument(doc)
		operations = append(operations, operation)
	}

	result, err := model.BulkWrite(context.Background(), operations)
	tops := len(operations)

	if nil != err || int(result.InsertedCount) != tops {
		bulkQueue = append(bulkQueue, operations)
	}

	fmt.Println("SaveQueue ", result, err, bulkQueue)

	return nil
}
