package business

import (
	"encoding/json"
	"ns-api/config"
	"ns-api/core/errors"
	"ns-api/core/sts"
)

const (
	metaProcName         = "GETMETATABLE_F"
	getComponentProcName = "GETMETACOMPONENT"
)

type componentRepository struct {
	sts.Repository
}

///

type headerColumn struct {
	Name       string
	Type       string
	Length     string
	Default    string
	IsComputed bool
	Alias      string
	IsNullable bool
}

type filterColumn struct {
	Name string
	Type string
}

type headerMeta struct {
	SourceName string
	PrimaryKey string
	ForeignKey string
	Columns    []headerColumn
	Details    []headerMeta
}

type componentMeta struct {
	// Type: Common
	Procedure  string
	SourceName string
	PrimaryKey string

	// Type: Form
	Header  headerMeta
	Details []headerMeta

	// Type: Table
	Columns []headerColumn
	Filters []filterColumn
}

type component struct {
	Id          int64  `json:"id"`
	Code        string `json:"code"`
	Type        int16  `json:"type"`
	Name        string `json:"name"`
	TypeName    string `json:"type_name"`
	RawMetadata string `json:"metadata"`
}

/////// Private functions declaration ///////

/////// Public functions declaration ///////

func (rp *componentRepository) GetComponent(us *sts.Client, componentId string) (*component, error) {
	var cmp []component
	rs, err := us.Sql.Exec(getComponentProcName, us.CompanyId, componentId)
	if nil != err {
		return nil, err
	}

	if err = rs.Unmarshal(&cmp); nil != err {
		return nil, err
	}

	if 0 == len(cmp) {
		return nil, errors.NewError("Component not exists")
	}

	return &cmp[0], nil
}

func (rp *componentRepository) GetMeta(us *sts.Client, componentId string) (*componentMeta, error) {
	var meta componentMeta

	rawMetadata, err := rp.GetCache(componentId)

	if nil != err {
		rs, err := rp.GetComponent(us, componentId)

		if nil != err {
			return nil, err
		}

		rawMetadata = []byte(rs.RawMetadata)

		if !config.IsDevMode {
			_ = rp.SetCache(componentId, rawMetadata)
		}

	}

	if !(0 < len(rawMetadata)) {
		return nil, errors.NewError("No metadata exists")
	}

	if err := json.Unmarshal(rawMetadata, &meta); nil != err {
		return nil, err
	}

	return &meta, nil
}

// Export name declaration
var Component = &componentRepository{}
