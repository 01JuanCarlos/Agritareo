package controllers

import (
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"net/http"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/server/wsserver"
	"ns-api/core/services/mongodb"
	"ns-api/core/sts"
)

type LogResponse struct {
	LogId string `json:"logid"`
}

func GetActivity(client *wsserver.WsClient, body []byte) interface{} {
	db, _ := mongodb.DB.GetConnection(client.CorporationId)
	result := db.Find("logs", bson.M{
		"companyId": client.CompanyId,
		"userId":    client.UserId,
	}, mongodb.QueryOptions{
		Select: bson.M{
			"_id":         0,
			"componentId": 1,
			"id":          1,
			"time":        1,
			"type":        1,
			"data":        1,
		},
	})
	return result
}

func GetLogID(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")

	db, _ := mongodb.DB.GetConnection(user.CorporationId)

	pipe := mongo.Pipeline{
		{{"$match", bson.M{"transactionUid": id}}},
		{{"$addFields", bson.D{
			{"arr01", bson.D{
				{"$map", bson.M{
					"input": bson.D{
						{"$filter", bson.M{
							"input": bson.D{{"$objectToArray", "$data"}},
							"as":    "it",
							"cond":  bson.D{{"$ne", bson.A{"$$it.k", "detalles"}}},
						}},
					},
					"as": "it",
					"in": bson.M{
						"table": "principal",
						"field": "$$it.k",
						"value": "$$it.v",
					},
				}},
			}},
			{"arr02", bson.D{
				{"$reduce", bson.M{
					"input":        bson.D{{"$objectToArray", "$data.detalles"}},
					"initialValue": bson.A{},
					"in": bson.D{
						{"$concatArrays", bson.A{
							"$$value",
							bson.D{
								{"$map", bson.M{
									"input": "$$this.v",
									"as":    "it",
									"in": bson.M{
										"table": "$$this.k",
										"value": bson.D{
											{"$map", bson.M{
												"input": bson.D{{"$objectToArray", "$$it"}},
												"as":    "it",
												"in": bson.M{
													"table": "$$this.k",
													"field": "$$it.k",
													"value": "$$it.v",
												},
											}},
										},
									},
								}},
							},
						}},
					},
				}},
			}},
		}}},
		{{"$project", bson.M{
			"id":       1,
			"_id":      0,
			"type":     1,
			"time":     "$createdAt",
			"username": 1,
			"changes": bson.D{{"$concatArrays", bson.A{"$arr01", bson.D{
				{"$ifNull", bson.A{"$arr02", bson.A{}}},
			}}}},
		}}},
	}

	data, _ := db.Aggregate2("logs", pipe)

	return httpmessage.Send(data)
}
