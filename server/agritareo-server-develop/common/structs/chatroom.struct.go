package structs

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type ChatMessage struct {
	From    int64              `json:"from"`
	To      int64              `json:"to"`
	Message string             `json:"message"`
	Time    time.Duration      `json:"time"`
	Id      primitive.ObjectID `json:"_id"`
}

type ChatUser struct {
	Name      string `json:"name"`
	UserId    int64  `json:"user_id"`
	CompanyId int64  `json:"company_id"`
	ProfileId int64  `json:"profile_id"`
	Profile   string `json:"profile"`
	Photo     string `json:"photo"`
	Chats     []Chat `json:"chats"`
}

type Chat struct {
	ChatUser
	LastMessage ChatMessage
	Connected   bool
}

type ChatRoom struct {
	Users         []ChatUser    `json:"users"`
	Id            string        `json:"roomId"`
	Messages      []ChatMessage `json:"messages"`
	MaxMessages   int           `json:"max_messages"`
	LastMessageId int           `json:"-"`
}
