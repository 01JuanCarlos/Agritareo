package utils

import (
	"encoding/csv"
	"fmt"
	"github.com/360EntSecGroup-Skylar/excelize"
	"github.com/jung-kurt/gofpdf"
	"io"
	"io/ioutil"
	"net/http"
	"ns-api/common/utils"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"os"
	"strconv"
	"strings"
	"time"
)

type formatBody struct {
	Header []map[string]interface{} `json:"headers"`
	File   string                   `json:"file"`
	Cid    string                   `json:"cid"`
}

func contain(k string) (result bool) {
	words := []string{
		"fecha",
		"nro",
		"anio",
		"area",
		"cultivo",
		"codigo",
	}
	for _, i := range words {
		if x := strings.Contains(k, i); x {
			return !result
		}
	}
	return
}

func ExportFiles(user *sts.Client, w http.ResponseWriter, r *http.Request) httpmessage.HttpMessage {

	var body formatBody
	_ = utils.ParseBody(r, &body)

	if body.Header == nil || body.File == "" || body.Cid == "" {
		return httpmessage.Error("parametros incorrectos")
	}

	var theBestHeaders []string
	keys := make(map[string]string, 0)
	oldName := make(map[string]interface{})
	var countSmallSize, countBigHeaders int
	countLenHeader := 0
	for _, i := range body.Header {
		if countLenHeader > 10 {
			break
		}

		if oldName[i["field"].(string)] == nil {
			keys[i["field"].(string)] = i["label"].(string) // field and label
			theBestHeaders = append(theBestHeaders, i["field"].(string))
			oldName[i["field"].(string)] = 1
			//if i["field"].(string) == "anio" || i["field"].(string) == "codigo" || i["field"].(string) == "area" || i["field"].(string) ==   {
			//	countSmallSize++
			//}
			//switch i["field"].(string) {
			//
			//case "nombrenivel":
			//	//
			//default:
			//	countSmallSize++
			//}

			if contain(i["field"].(string)) {
				countSmallSize++
			}
			countLenHeader++
		}

	}
	query:= fmt.Sprintf(`NS_%v_L %v,null,'',null,'0',''`, body.Cid, user.CompanyId)

	if body.Cid == "BITACORA_AGRICOLA_SANITARIA" {
		r1:= utils.GetQuery(r, "r", "")
		e:= utils.GetQuery(r, "e", "")
		query= fmt.Sprintf(`NS_%v_L %v,null,null,null,null,'%v','%v'`, body.Cid, user.CompanyId, r1, e)
	}
	if body.Cid == "CONCEPTO_AGRICOLA" {
		tc := utils.GetQuery(r, "concept", "")
		query= fmt.Sprintf(`NS_%v_L %v,null,null,null,null,'%v'`, body.Cid, user.CompanyId, tc)
	}
	if body.Cid == "CULTIVO_VARIEDAD" ||
		body.Cid == "TIPO_CONCEPTO_AGRICOLA" ||
		body.Cid == "CONTROLADOR_RIEGO" ||
		body.Cid == "EVALUADOR" ||
		body.Cid == "CAMPANIA_AGRICOLA" ||
		body.Cid == "ZONA_GEOGRAFICA" ||
		body.Cid == "ESTADO_FENOLOGICO" {
		query= fmt.Sprintf(`NS_%v_L %v,null,null,null`, body.Cid, user.CompanyId)
	}
		//user.CompanyId,
		//nil,
		//"",
		//nil,
		//"0",
		//""
		//println(query)
	result, err := user.Sql.Page(query)
	if err != nil {
		return httpmessage.Error(err)
	}
	resultSp := result.Data.([]map[string]interface{})

	tempName := body.Cid
	if body.File != "" {
		tempName = tempName + "." + body.File
		w.Header().Set("Content-Disposition", "attachment; filename="+tempName+"")

		switch body.File {
		case "csv":
			m := csv.NewWriter(w)
			defer m.Flush()
			if len(theBestHeaders) != 0 {
				var headersToLabel []string
				for _, i := range theBestHeaders {
					headersToLabel = append(headersToLabel, keys[i])
				}
				err := m.Write(headersToLabel)
				if err != nil {
					return httpmessage.Error(err)
				}

			}

			for _, i := range resultSp {
				var r []string
				keyindex := 0
				for _, x := range theBestHeaders {
					if i[x] == nil {
						r = append(r, fmt.Sprintf("%v", "-"))
					} else {
						tempValue := i[x]
						if fmt.Sprintf("%T", tempValue) == "time.Time" {

							t := i[x].(time.Time)
							tempValue = t.Format("02/01/2006")
						}
						r = append(r, fmt.Sprintf("%v", tempValue))
					}

					keyindex++
				}
				err := m.Write(r)
				if err != nil {
					return httpmessage.Error(err)
				}

			}
			m.Flush()
		case "pdf":
			marginCell := 1.
			//# DE COLUMANAS + DE 8 L < = P

			orientation := "L"
			//extraSize := 10
			if len(theBestHeaders) <= 5 {
				orientation = "P"
				//extraSize = 20
			}

			pdf := gofpdf.New(orientation, "mm", "A4", "")
			pdf.SetFont("Arial", "", 7)
			pdf.AddPage()
			pagew, pageh := pdf.GetPageSize()
			mleft, mright, _, mbottom := pdf.GetMargins()
			cols := make(map[string]float64, 0)

			sizeCode := 20.
			bigSizeHeader := 40.
			lenHeadersSmall := sizeCode * float64(countSmallSize)
			lenBigHeaders := bigSizeHeader * float64(countBigHeaders)
			allHeaders := float64(len(theBestHeaders) - countSmallSize - countBigHeaders)
			size := (pagew - mleft - mright - lenHeadersSmall - lenBigHeaders) / allHeaders

			for _, x := range theBestHeaders {
				if contain(x) {
					cols[x] = sizeCode
				} else {
					cols[x] = size
				}
			}

			height1 := 0.
			_, lineHt1 := pdf.GetFontSize()

			pdf.SetFont("", "B", 0)


			titlesReport := map[string]string{
				"CENTROCOSTO": "CENTROS DE COSTOS",
				"BITACORA_AGRICOLA_SANITARIA": "BITACORA",
				"CULTIVO_VARIEDAD": "CULTIVOS",
				"TIPO_CONCEPTO_AGRICOLA": "TIPOS DE CONCEPTOS",
				"CONTROLADOR_RIEGO": "CONTROLADORES DE RIEGO",
				"EVALUADOR": "USUARIOS",
				"METODO_EVALUACION_AGRICOLA": "MÉTODOS DE EVALUACIÓN",
				"CAMPANIA_AGRICOLA": "CAMPAÑAS AGRICOLAS",
				"ZONA_GEOGRAFICA": "ZONAS GEOGRÁFICAS",
				"ESTADO_FENOLOGICO": "ESTADOS FENOLOGICOS",
				"CONCEPTO_AGRICOLA": "CONCEPTOS AGRICOLAS",
			}


			pdf.Cell(40, 0, "REPORTE "+ titlesReport[body.Cid])
			pdf.Ln(5)
			curx1, y1 := pdf.GetXY()
			x1 := curx1
			for _, txt := range theBestHeaders {

				lines := pdf.SplitLines([]byte(fmt.Sprintf("%v", txt)), cols[txt])
				h := float64(len(lines))*lineHt1 + marginCell*float64(len(lines))
				if h > height1 {
					height1 = h
				}
			}
			for _, txt := range theBestHeaders {

				width := cols[txt]
				pdf.Rect(x1, y1, width, height1, "")
				//

				tr := pdf.UnicodeTranslatorFromDescriptor("")

				pdf.MultiCell(width, lineHt1+marginCell, fmt.Sprintf("%v", tr(keys[txt])), "", "", false)
				x1 += width
				pdf.SetXY(x1, y1)
			}
			pdf.SetXY(curx1, y1+height1)
			pdf.SetFont("", "", 0)
			for _, row := range resultSp {
				curx, y := pdf.GetXY()
				x := curx
				height := 0.
				_, lineHt := pdf.GetFontSize()

				for _, txt := range theBestHeaders {
					text := row[txt]
					if fmt.Sprintf("%T", text) == "time.Time" {
						t := text.(time.Time)
						text = t.Format("02/01/2006")

					}
					if fmt.Sprintf("%T", text) == "[]uint8"{
						area := string(text.([]uint8))
						areat ,_ := strconv.ParseFloat(area, 64)
						text = fmt.Sprintf("%v", areat)

					}
					lines := pdf.SplitLines([]byte(fmt.Sprintf("%v", text)), cols[txt])
					h := float64(len(lines))*lineHt + marginCell*float64(len(lines))
					if h > height {
						height = h
					}

				}
				// add a new page if the height of the row doesn't fit on the page
				if pdf.GetY()+height > pageh-mbottom {
					pdf.AddPage()
					y = pdf.GetY()
				}
				for _, txt := range theBestHeaders {
					width := cols[txt]
					pdf.Rect(x, y, width, height, "")

					fixTxt := row[txt]
					if fixTxt == nil {
						fixTxt = ""
					}
					if fmt.Sprintf("%T", fixTxt) == "time.Time" {
						t := fixTxt.(time.Time)
						fixTxt = t.Format("02/01/2006")

					}
					if fmt.Sprintf("%T", fixTxt) == "[]uint8"{
						area := string(fixTxt.([]uint8))
						areat ,_ := strconv.ParseFloat(area, 64)
						fixTxt = fmt.Sprintf("%v", areat)

					}
					tr := pdf.UnicodeTranslatorFromDescriptor("")
					word := fmt.Sprintf("%v", tr(fmt.Sprintf("%v", fixTxt)))
					pdf.MultiCell(width, lineHt+marginCell, word, "", "", false)
					x += width
					pdf.SetXY(x, y)
				}
				pdf.SetXY(curx, y+height)

			}
			// ------- temp folder
			tmpDirk, err := ioutil.TempDir(os.TempDir(), "ns-")

			if err != nil {
				return httpmessage.Error(err)
			}
			//-------------------
			fixTempDirk := tmpDirk + "/" + tempName
			err = pdf.OutputFileAndClose(fixTempDirk)
			if err != nil {
				return httpmessage.Error(err)
			}

			k, err := os.Open(fixTempDirk)
			if err != nil {
				return httpmessage.Error(err)
			}
			defer k.Close()

			io.Copy(w, k)
		case "xlsx":

			w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
			//path := "./test/Book1.xlsx"
			f := excelize.NewFile()

			// headers
			hc := 1
			hf := byte('A')
			for _, i := range theBestHeaders {
				celda := fmt.Sprintf("%v%v", string(hf), hc)
				f.SetCellValue("Sheet1", celda, keys[i]) // keys label
				hf += 1
			}

			row := 2
			for _, i := range resultSp {
				first := byte('A')
				keyindex := 0
				for range theBestHeaders {
					if f.GetCellValue("Sheet1", "A2") == "" {
						f.SetCellValue("Sheet1", "A2", i[theBestHeaders[keyindex]])
						first += 1
						keyindex++
					} else {

						tempValue := i[theBestHeaders[keyindex]]

						if fmt.Sprintf("%T", tempValue) == "time.Time" {
							t := tempValue.(time.Time)
							tempValue = fmt.Sprintf("%v", t.Format("02/01/2006"))
						}

						celda := fmt.Sprintf("%v%v", string(first), row)
						f.SetCellValue("Sheet1", celda, tempValue)
						keyindex++
						first += 1
					}
				}
				row++

			}

			// ------- temp folder
			tmpDirk, err := ioutil.TempDir(os.TempDir(), "ns-")
			fixTempDirk := tmpDirk + "/" + tempName
			if err != nil {
				return httpmessage.Error(err)
			}
			//-------------------
			if err := f.SaveAs(fixTempDirk); err != nil {
				println(err.Error())
			}
			k, err := os.Open(fixTempDirk)
			if err != nil {
				return httpmessage.Error(err)
			}
			defer k.Close()

			io.Copy(w, k)
		}
		return httpmessage.Stream([]byte{}, "application/octet-stream")
	}

	return httpmessage.Error("formato incorrecto")
}
