package sts

type ValidateError struct {
	Field string `json:"field"`
	Tag   string `json:"tag"`
	Name  string `json:"name"`
	// Value interface{} `json:"value,omitempty"`
}
