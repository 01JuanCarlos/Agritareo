package controllers

import (
	"encoding/json"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"ns-api/common/constants"
	"ns-api/common/logger"
	"ns-api/core/server/wsserver"
	"ns-api/core/services/mongodb"
	"time"
)

type CustomLayout struct {
	Id             string                 `json:"id"`
	Labels         map[string]interface{} `json:"layouts"`
	DefaultValues  map[string]interface{} `json:"defaults"`
	RequiredValues map[string]interface{} `json:"required"`
}

func GetCustomLayout(client *wsserver.WsClient, body []byte) {
	var data CustomLayout
	_ = json.Unmarshal(body, &data)

	//result := mongodb.Find(fmt.Sprintf(`custom-layout%s`, client.CompanyId), bson.M{})

	response := CustomLayout{
		Id:             "",
		Labels:         nil,
		DefaultValues:  nil,
		RequiredValues: nil,
	}
	//response.Labels =
	client.Send(int(constants.WsServerCustomLayout), response)
}

func SaveCustomLayout(client *wsserver.WsClient, body []byte) {
	var data CustomLayout
	_ = json.Unmarshal(body, &data)
	var operations []mongo.WriteModel

	if nil != data.Labels {
		for key, value := range data.Labels {
			operation := mongo.NewUpdateOneModel()
			operation.SetUpsert(true)
			operation.Filter = bson.M{
				"cid":       data.Id,
				"user_id":   client.GetUserId(),
				"companyId": client.GetCompanyId(),
				"key":       key,
				"type":      "label",
			}
			operation.Update = bson.M{
				"$set": bson.M{
					"cid":       data.Id,
					"user_id":   client.GetUserId(),
					"companyId": client.GetCompanyId(),
					"key":       key,
					"type":      "label",
					"value":     value,
					"date":      time.Now(),
				},
			}
			operations = append(operations, operation)
		}

		db, _ := mongodb.DB.GetConnection(client.GetCorporationId())
		_, err := db.BulkWrite("custom-layout", operations)

		if nil != err {
			logger.Error("Labels: %s", err.Error())
		}
	}

	if nil != data.DefaultValues {
		for key, value := range data.Labels {
			operation := mongo.NewUpdateOneModel()
			operation.SetUpsert(true)
			operation.Filter = bson.M{
				"cid":       data.Id,
				"user_id":   client.GetUserId(),
				"companyId": client.GetCompanyId(),
				"key":       key,
				"type":      "input",
			}
			operation.Update = bson.M{
				"$set": bson.M{
					"cid":       data.Id,
					"user_id":   client.GetUserId(),
					"companyId": client.GetCompanyId(),
					"key":       key,
					"type":      "input",
					"value":     value,
					"date":      time.Now(),
				},
			}
			operations = append(operations, operation)
		}

		db, _ := mongodb.DB.GetConnection(client.GetCorporationId())
		_, err := db.BulkWrite("custom-layout", operations)

		if nil != err {
			logger.Error("default: %s", err.Error())
		}
	}

	if nil != data.RequiredValues {
		//row = data.RequiredValues
	}

}

func UpdateCustomLayout(client *wsserver.WsClient, body []byte) {

}
