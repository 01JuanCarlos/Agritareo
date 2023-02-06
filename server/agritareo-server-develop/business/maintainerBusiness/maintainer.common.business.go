package maintainerBusiness

import (
	"ns-api/core/sts"
)

type repository struct {
	sts.Repository
}

///////STRUCT METATABLE//////////////////
type MetaTable struct {
	Struct string      `json:"struct"`
	View   interface{} `json:"proc,omitempty"`
	Proc   interface{} `json:"proc,omitempty"`
}

///////STRUCT SUGGEST//////////////////
type Suggest struct {
	ID          interface{} `json:"id"`
	Code        interface{} `json:"code,omitempty"`
	Label       string      `json:"label,omitempty"`
	Description interface{} `json:"description,omitempty"`
	Icon        interface{} `json:"icon,omitempty"`
	Badge       string      `json:"badge,omitempty"`
}
type suggestStruct struct {
	SourceName   string
	PrimaryKey   string
	Filter       string
	QueryCol     string
	IsCompany    int
	FilterParent string
}

type StSuggest struct {
	StructSuggest suggestStruct `json:"struct_suggest"`
}

///////////////////////////////////////
//////////STRUCT MAINTAINER////////////
type StMaintainer struct {
	StructMaintainer body   `json:"struct_maintainer"`
	ProcI            string `json:"proc_i"`
	ProcU            string `json:"proc_u"`
	ProcF            string `json:"proc_f"`
	Proc             string `json:"proc"`
}
type body struct {
	Header Info
	Detail []DetailInfo
}
type Info struct {
	SourceName   string
	PrimaryKey   string
	ForeignKey   string
	Columns      []columns
	QueryCol     string
	Filter       string
	FilterParent string
}

type DetailInfo struct {
	Name  string
	Value Info
}
type columns struct {
	Name        string
	Type        string
	Length      string
	Default     interface{}
	Is_Computed interface{}
}

/////////////////////////////////////
///FUNCONES PROVIDAS

///FUNCIONES PUBLICAS

// VARIABLES PUBLICAS
var MtBusinnes = &repository{}
