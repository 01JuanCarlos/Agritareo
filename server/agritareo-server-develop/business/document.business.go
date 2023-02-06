package business

import (
	"ns-api/core/sts"
)

type documentRepository struct {
	sts.Repository
}

/////// constants ///////
var DOCPROCEDURE = "DOCSERIE_L"

/////// Struct declaration ///////

type result struct {
	ID    string `db:"id" json:"id"`
	Label string `db:"label" json:"label"`
}

type sample struct {
	Documents []result `json:"documents"`
	Series    []result `json:"series"`
	Number    string   `json:"number"`
}

/////// Private functions declaration ///////

/////// Public functions declaration ///////

// Get documents
func (bs *documentRepository) Documents(us *sts.Client, cmpId string) []result {
	var rs []result
	if db, isValid := bs.Connection(us.Sql); isValid {
		_ = db.SelectProcedure(&rs, DOCPROCEDURE, us.CompanyId, cmpId)
	}
	return rs
}

// Get document series
func (bs *documentRepository) Series(us *sts.Client, cmpId, docId string) []result {
	var rs []result
	if db, isValid := bs.Connection(us.Sql); isValid {
		_ = db.SelectProcedure(&rs, DOCPROCEDURE, us.CompanyId, cmpId, docId)
	}
	return rs
}

// Get document number
func (bs *documentRepository) Number(us *sts.Client, cmpId, docId, sId string) []result {
	var rs []result
	if db, isValid := bs.Connection(us.Sql); isValid {
		_ = db.SelectProcedure(&rs, DOCPROCEDURE, us.CompanyId, cmpId, docId, sId)
	}
	return rs
}

// Get sample doc, ser, number
func (bs *documentRepository) Sample(us *sts.Client, cmpId string) (smp sample, ok bool) {
	//smp := sample{}
	docs := bs.Documents(us, cmpId)

	if 0 < len(docs) {
		ok = !ok
		smp.Documents = docs
		series := bs.Series(us, cmpId, docs[0].ID)
		if 0 < len(series) {
			smp.Series = series
			number := bs.Number(us, cmpId, docs[0].ID, series[0].ID)
			if 0 < len(number) {
				smp.Number = number[0].Label
			}
		}
	}
	return
}

// Export name declaration
var Document = &documentRepository{}
