package sts

import (
	"fmt"
	"strings"
)

type Body map[string]interface{}

func (b Body) Get(key string, def ...interface{}) ExtendedMap {
	return &ExtendMap{key, b, def}
}

func (b *Body) Set(key string, value interface{}) {
	(*b)[key] = value
}

//////

type Query map[string]interface{}

func (q Query) Get(key string, def ...interface{}) ExtendedMap {
	return &ExtendMap{key, q, def}
}

//////

type Params map[string]interface{}

func (p Params) Get(key string, def ...interface{}) ExtendedMap {
	return &ExtendMap{key, p, def}
}

//////

type Header map[string]interface{}

func (h Header) Get(key string, def ...interface{}) ExtendedMap {
	return &ExtendMap{key, h, def}
}

type HttpRequest struct {
	Method        string
	IsTransaction bool
	TransactionId string
	ComponentId   string
	CorporationId string
	ModuleId      string
	Body          Body
	Query         Query
	Params        Params
	Header        Header
}

func (r *HttpRequest) GetBody() Body {
	// todo limpia temporalmente prra
	for k, v := range r.Body {
		tipo := fmt.Sprintf("%T", v)
		if tipo == "string" {
			r.Body[k] = strings.TrimSpace(v.(string))
		}
	}
	return r.Body
}

func (r *HttpRequest) IsEmptyBody() bool {
	return nil == r.Body
}

func (r *HttpRequest) GetQuery() Query {
	return r.Query
}

func (r *HttpRequest) GetParams() Params {
	return r.Params
}

func (r *HttpRequest) GetHeader() Header {
	return r.Header
}
