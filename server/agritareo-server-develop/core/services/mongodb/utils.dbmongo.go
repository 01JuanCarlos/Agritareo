package mongodb

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	mongoOptions "go.mongodb.org/mongo-driver/mongo/options"
	"ns-api/modules/log"
	"time"
)

type QueryOptions struct {
	Select bson.M
	Order  bson.M
	Limit  int64
	Multi  bool
	Upsert bool
}

func (conn *MongoConnection) Find(collection string, filter interface{}, options ...QueryOptions) []bson.M {
	model := conn.Collection(conn.Id, collection)

	if nil == model {
		return []bson.M{}
	}

	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	pipe := mongo.Pipeline{
		{{"$match", filter}},
	}
	if len(options) > 0 {
		option := options[0]
		if len(option.Select) > 0 {
			pipe = append(pipe, bson.D{{"$project", option.Select}})
		}

		if len(option.Order) > 0 {
			pipe = append(pipe, bson.D{{"$sort", option.Order}})
		}

		if option.Limit > 0 {
			pipe = append(pipe, bson.D{{"$limit", option.Limit}})
		}
	}

	if !(len(options) > 0 && len(options[0].Order) > 0) {
		pipe = append(pipe, bson.D{{"$sort", bson.M{"_id": -1}}})
	}

	cursor, err := model.Aggregate(ctx, pipe)
	result := make([]bson.M, 0)
	// fixme: Retornar o informar del error.
	if nil != err {
		log.Error("MongoDB: ", err.Error())
		return result
	} else {
		for cursor.Next(ctx) {
			var row bson.M
			err := cursor.Decode(&row)
			if nil == err {
				result = append(result, row)
			} else {
				fmt.Println("Cursor error")
			}
		}
	}

	//defer cursor.Close(ctx)

	return result
}

func (conn *MongoConnection) FindOne(collection string, filter interface{}, options ...QueryOptions) interface{} {
	option := QueryOptions{
		Limit: 1,
	}

	if len(options) > 0 {
		option.Order = options[0].Order
		option.Select = options[0].Select
	}
	result := conn.Find(collection, filter, option)
	return result
}

func (conn *MongoConnection) Delete(collection string, filter interface{}, options ...QueryOptions) (err error) {
	model := conn.Collection(conn.Id, collection)
	ctx, _ := context.WithTimeout(context.Background(), 5*time.Second)

	if len(options) > 0 && options[0].Multi {
		_, err = model.DeleteMany(ctx, filter)
		return
	}
	_, err = model.DeleteOne(ctx, filter)
	return
}

func (conn *MongoConnection) BulkWrite(collection string, operations []mongo.WriteModel) (*mongo.BulkWriteResult, error) {
	return conn.Collection(conn.Id, collection).BulkWrite(context.Background(), operations)
}

func (conn *MongoConnection) Update(collection string, filter interface{}, data interface{}, options ...QueryOptions) (err error) {
	model := conn.Collection(conn.Id, collection)
	ctx, _ := context.WithTimeout(context.Background(), 5*time.Second)
	modelOptions := &QueryOptions{
		Multi:  false,
		Upsert: false,
	}

	if len(options) > 0 {
		modelOptions.Multi = options[0].Multi
		modelOptions.Upsert = options[0].Upsert
	}

	if modelOptions.Multi {
		_, err = model.UpdateMany(ctx, filter, bson.M{"$set": data}, mongoOptions.Update().SetUpsert(modelOptions.Upsert))
	} else {
		_, err = model.UpdateOne(ctx, filter, bson.M{"$set": data}, mongoOptions.Update().SetUpsert(modelOptions.Upsert))
	}
	return
}
