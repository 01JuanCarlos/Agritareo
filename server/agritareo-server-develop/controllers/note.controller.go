package controllers

import (
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"net/http"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/services/mongodb"
	"ns-api/core/sts"
	"ns-api/locale"
	"strconv"
	"time"
)

type bodyNote struct {
	Type        string `json:"tipo" validate:"required"`
	Subject     string `json:"asunto" validate:"required"`
	Note        string `json:"nota" validate:"required"`
	ComponentID string `json:"componentId" validate:"required"`
	FormId      int    `json:"formId" validate:"required"`
	//TransactionUID string `json:"transaction_uid,omitempty"`
}

func PostNote(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var body bodyNote
	_ = utils.ParseBody(r, &body)
	// cid := utils.GetQuery(r, "cid")
	db, _ := mongodb.DB.GetConnection(user.CorporationId)
	_, err := db.Save("notes", bson.M{
		"userId":        user.UserId,
		"userName":      user.UserName,
		"companyId":     user.CompanyId,
		"corporationId": user.CorporationId,
		"componentId":   body.ComponentID,
		"formId":        body.FormId,
		"time":          time.Now(),
		"type":          body.Type,
		"data":          body,
	})

	if err != nil {
		return httpmessage.Error(locale.SomethingBadHappened)
	}
	return httpmessage.Empty()
}

func DeleteNote(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetVar(r, "id")
	db, _ := mongodb.DB.GetConnection(user.CorporationId)
	ObjectID, _ := primitive.ObjectIDFromHex(id)

	err := db.Delete("notes", bson.M{
		"_id":    ObjectID,
		"userId": user.UserId,
	})

	if err != nil {
		fmt.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Empty()
}

func GetNote(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	//id := utils.GetVar(r, "id")
	form := utils.GetQuery(r, "f")
	id := utils.GetQuery(r, "c")
	if form == nil || id == nil {
		return httpmessage.Error(locale.MissingFields)
	}

	formInt, err := strconv.Atoi(form.(string))
	if err != nil {
		return httpmessage.Error(locale.MissingFields)
	}

	db, _ := mongodb.DB.GetConnection(user.CorporationId)

	result := db.Find("notes", bson.M{
		"componentId": id,
		"companyId":   user.CompanyId,
		// "userId":      user.UserId,
		"formId": formInt,
		"$or": []interface{}{
			bson.M{"type": "g"},
			bson.M{"type": "p", "userId": user.UserId},
		},
	})
	return httpmessage.Send(result)
}
