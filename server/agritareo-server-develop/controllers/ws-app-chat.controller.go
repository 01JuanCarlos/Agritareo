package controllers

import (
	"fmt"
	uuid "github.com/nu7hatch/gouuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"ns-api/common/structs"
	"ns-api/core/server/wsserver"
)

type ChatUserBody struct {
	Alias     string `json:"alias"`
	ProfileId int    `json:"profile_id"`
	Profile   string `json:"profile"`
	UserId    int64  `json:"user_id"`
	Photo     string `json:"photo"`
}

//type ChatResponse struct {
//	Chats  []structs.Chat `json:"chats"`
//	RoomId string         `json:"id"`
//}

var room structs.ChatRoom

func init() {
	uid, _ := uuid.NewV4()
	room = structs.ChatRoom{
		Users:         make([]structs.ChatUser, 0),
		Messages:      make([]structs.ChatMessage, 0),
		Id:            uid.String(),
		MaxMessages:   30, // Historial de mensajes que se van a almacenar.
		LastMessageId: 1,
	}
}

func AddMessage(client *wsserver.WsClient, body []byte) {
	//var data structs.ChatMessage
	//_ = json.Unmarshal(body, &data)
	//
	//var message = structs.ChatMessage{
	//	UserId:  client.UserId,
	//	Message: data.Message,
	//	Time:    data.Time,
	//	Id:      room.LastMessageId + 1,
	//}
	//
	//if len(room.Messages) > room.MaxMessages {
	//	room.Messages = room.Messages[1:]
	//}
	//
	//room.LastMessageId = message.Id
	//room.Messages = append(room.Messages, message)
	//client.Emit(constants.WsServerChatMessage, message)
}

func GetChatRoom(client *wsserver.WsClient, body []byte) interface{} {
	var user ChatUserBody

	if model := client.NoSql; nil != model && model.IsConnected() {
		client.NoSql.SaveQueue("chat.users", bson.M{"user_id": 1110}, bson.M{"user_id": 1111})
		pipe := mongo.Pipeline{
			{{"$match", bson.M{"user_id": client.UserId}}},
		}

		result, err := model.Aggregate2("chat.users", pipe)

		if nil == err {
			//for cursor.Next(cursor.Current.Values())
		}
		fmt.Println(fmt.Sprintf("%+v\n", user))
		fmt.Println(result)
		//fmt.Println(user.UserId, client.ConnectionId, result, err)
	}

	return &room
	//
	//_ = json.Unmarshal(body, &user)
	//
	//db, _ := mongodb.Mssql.GetConnection(client.CorporationId)
	//result := db.Find("chats", bson.M{
	//	"$or": bson.A{
	//		bson.M{"fromId": client.UserId},
	//		bson.M{"toId": client.UserId},
	//	},
	//})
	//
	//jsonbody, _ := json.Marshal(result)
	//
	//_ = json.Unmarshal(jsonbody, &chats)
	//
	//return &ChatResponse{
	//	RoomId: room.Id,
	//	Chats:  chats,
	//}

	//for _, user := range room.Users {
	//	if user.UserId == client.UserId {
	//		return &room
	//	}
	//}
	//
	//room.Users = append(room.Users, structs.ChatUser{
	//	UserId:   client.UserId,
	//	Username: user.Alias,
	//	Photo:    user.Photo,
	//	Profile:  user.Profile,
	//})
	//return &room
	// chats: [ //conectados, //no conectados] <- from database
}
