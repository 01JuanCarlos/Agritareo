package mongodb

import (
	"context"
	"encoding/json"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"ns-api/common/logger"
	"time"
)

type LogDB struct {
	Path           string
	Data           interface{}
	Type           string
	UserID         int64
	UserName       string
	Id             int
	TransactionUID string
	ComponentID    string
	Time           int64
}


func UpsertOne(coleccion, id string, user int64, data []byte) (e error) {
	conn, _ := DB.GetConnection("00001")
	collect := conn.Collection("00001", coleccion)
	ctx, _ := context.WithTimeout(context.Background(), 5*time.Second)
	//---------------------
	search := bson.M{"componentid": id, "userid": user}

	var test map[string]interface{}
	_ = json.Unmarshal(data, &test)
	dataform := test
	//fmt.Println(test)
	upsertData := bson.M{"$set": dataform}
	if info, err := collect.UpdateOne(ctx,
		search,
		upsertData,
		options.Update().SetUpsert(true)); err != nil {
		fmt.Println("err", err)
	} else {
		logger.Debug(info)
		//fmt.Println("la info", info)
	}

	return
}
