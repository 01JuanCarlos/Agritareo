package controllers

import (
	"encoding/json"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"ns-api/common/logger"
	"ns-api/core/server/wsserver"
	"ns-api/core/services/mongodb"
)

// fixme integrar con la view
type bodyLabel struct {
	ComponentID string `json:"componentid"`
}

//func PutLabels(user *sts.WsClient, body []byte) {
//	var data bodyLabel
//	_ = json.Unmarshal(body, &data)
//	logger.Debug(body)
//	db, _ := mongodb.DB.GetConnection(user.ConnectionId)
//	search := bson.M{"componentid": data.ComponentID, "userid": user.UserId}
//	// fixme complete struct bodyLabel and more fields
//	_, err := db.Upsert("label", search, bson.M{"$set": bson.M{
//		"componentId":   data.ComponentID,
//		"userId":        user.UserId,
//		"userName":      user.UserName,
//		"companyId":     user.CompanyId,
//		"corporationId": user.CorporationId,
//		"data":          body,
//	}})
//	if err != nil {
//		logger.Debug(err)
//		return
//	}
// }
type layouts struct {
	CID           string                 `json:"cid"`
	DefaultValues map[string]interface{} `json:"defaults"`
	Type          string                 `json:"type"`
}

func GetLabels(client *wsserver.WsClient, body []byte) interface{} {
	//id := utils.GetVar(r, "id")
	fmt.Println("id ", client.GetCorporationId(), client)
	var data layouts
	_ = json.Unmarshal(body, &data)
	db, err := mongodb.DB.GetConnection(client.GetCorporationId())
	if err != nil {
		logger.Debug(err)
		return nil
		//return httpmessage.Error(err)
	}
	result := db.Find("custom-layout", bson.M{"cid": data.CID})
	return result
}

func DeleteLabels(user *wsserver.WsClient, body []byte) interface{} {
	var data layouts
	_ = json.Unmarshal(body, &data)
	db, _ := mongodb.DB.GetConnection(user.GetCorporationId())
	err := db.Delete("custom-layout", bson.M{
		"cid":  data.CID,
		"type": data.Type,
	}, mongodb.QueryOptions{Multi: true})
	if err != nil {
		logger.Debug(err)
		return false
	}
	return true
}
