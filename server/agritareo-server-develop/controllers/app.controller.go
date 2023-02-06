package controllers

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"google.golang.org/grpc"
	"io/ioutil"
	"net/http"
	"ns-api/common/logger"
	"ns-api/common/utils"
	"ns-api/config"
	"ns-api/core/server/httpmessage"
	"ns-api/core/services/notify"
	"ns-api/core/services/updater"
	"ns-api/core/sts"
	"ns-api/internal/dialer"
	"ns-api/internal/proto"
	"ns-api/modules/log"
	"regexp"
	"strings"
)

type responseCorporation struct {
	Id        string                                        `json:"id"`
	Name      string                                        `json:"name"`
	Companies []*proto.RegisterResponse_Corporation_Company `json:"children"`
	SubDomain string                                        `json:"sub_domain"`
}

type ResponseApp struct {
	Corporations []responseCorporation              `json:"corporations"`
	Languages    []*proto.RegisterResponse_Language `json:"languages"`
}

func GetSunat() httpmessage.HttpMessage {
	client, conn, err := dialer.RouteClient()

	defer func() {
		err = conn.Close()
		if nil != err {
			log.Errorf("GetSunat: Connection close error %s", err.Error())
		}
	}()

	if err != nil {
		return httpmessage.Error(err)
	}

	result, err := client.Exchange(context.Background(), &proto.ExchangeRequest{})

	if nil != err {
		return httpmessage.Error(err)
	}

	return httpmessage.Send(result.GetSunat())
}

type Activity struct {
	Order  string `json:"order"`
	Number string `json:"id"`
	Name   string `json:"descripcion"`
}

type rucBody struct {
	Ruc             string     `json:"ruc"`
	RazonSocial     string     `json:"razon_social"`
	Estado          string     `json:"estado"`
	Nombre          string     `json:"nombre,omitempty"`
	ApellidoPaterno string     `json:"apellido_paterno,omitempty"`
	ApellidoMaterno string     `json:"apellido_materno,omitempty"`
	DNI             string     `json:"dni,omitempty"`
	Condicion       string     `json:"condicion"`
	Direccion       string     `json:"direccion"`
	Provincia       string     `json:"provincia"`
	Distrito        string     `json:"distrito"`
	Departamento    string     `json:"departamento"`
	Actividades     []Activity `json:"actividad_economica"`
}

func GetRuc(r *http.Request) httpmessage.HttpMessage {
	ruc := utils.GetVar(r, "id")
	var captcha string
	response, err := http.Get("http://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/captcha?accion=random")
	if err != nil {
		logger.Debug(err)
		return httpmessage.Error(err)
	}
	// GetCaptcha
	buf := new(bytes.Buffer)
	buf.ReadFrom(response.Body)
	captcha = buf.String()

	// -------------------
	url := fmt.Sprintf(
		"http://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/jcrS00Alias"+
			"?accion=consPorRuc"+
			"&nroRuc=%v"+
			"&actReturn=1"+
			"&numRnd=%v",
		ruc, captcha)
	logger.Debug(url)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return httpmessage.Error(err)
	}
	for _, cookie := range response.Cookies() {
		req.AddCookie(&http.Cookie{Name: cookie.Name, Value: cookie.Value})
	}
	client := &http.Client{}
	resp, _ := client.Do(req)
	body, _ := ioutil.ReadAll(resp.Body)
	html := string(body)
	re := regexp.MustCompile(`\r?\n`)
	replace := re.ReplaceAllString(html, "")
	regexHeader := regexp.MustCompile(`(<table[^>]*>(?:.|\n)*?<\/table>)`)
	table := regexHeader.FindAllString(replace, -1)[1]
	regexTr := regexp.MustCompile(`(<tr[^>]*>(?:.|\n)*?<\/tr>)`)
	regexTd := regexp.MustCompile(`(<td[^>]*>(?:.|\n)*?<\/td>)`)
	headerTr := regexTr.FindAllString(table, -1)
	//--------------
	invalidRuc := regexp.MustCompile(`(<strong[^>]*>(?:.|\n)*?<\/strong>)`)
	returnValue := invalidRuc.FindAllString(headerTr[0], -1)
	if len(returnValue) > 0 {
		return httpmessage.Error(fmt.Sprintf(`El Ruc %v consultado no es valido`, ruc))
	}
	//- ------
	temp := map[string]string{} // key - value sunat
	var Data = map[int]string{
		1: "RUC",
		2: "Nombre Comercial",
		3: "Estado del Contribuyente",
		4: "Domicilio Fiscal",
		5: "Condici&oacute;n del Contribuyente",
		6: "Actividad(es)",
		7: "Tipo Contribuyente",
		8: "Tipo de Documento",
	}
	for _, v := range headerTr {
		headerTd := regexTd.FindAllString(v, -1)
		nf := regexp.MustCompile(`\<.*?\>`)

		var keyValue []string
		for n, _ := range headerTd {
			trString := nf.FindAllString(headerTd[n], -1)
			filtered := strings.TrimSuffix(headerTd[n], trString[1])
			filtered = strings.TrimPrefix(filtered, trString[0])
			keyValue = append(keyValue, filtered)
		}

		value := strings.TrimSpace(keyValue[1])
		for _, data := range Data {
			ok := strings.Contains(keyValue[0], data)
			if ok {
				temp[data] = value
			}
		}
	}
	// direccion
	dir := temp[Data[4]]
	direccion := strings.Split(dir, "-")
	dirOne := strings.TrimSpace(direccion[0])
	subDir := strings.Split(dirOne, "  ")
	// ruc - name
	rucAndMore := strings.Split(temp[Data[1]], "-")
	// solo if es persona

	var nombre, apellidoPaterno, apellidoMaterno, dni string
	ok := strings.Contains(temp[Data[7]], "PERSONA NATURAL")
	if ok {

		Documents := strings.Split(temp[Data[8]], "-")
		fullName := strings.Split(Documents[1], ",")
		nombre = fullName[1]
		apellidos := strings.Split(strings.TrimSpace(fullName[0]), " ")
		apellidoPaterno = apellidos[0]
		apellidoMaterno = apellidos[1]
		formatDNI := strings.Split(Documents[0], "  ")
		dni = strings.TrimSpace(formatDNI[1])
	}
	// Get All Actividades
	activityReg := regexp.MustCompile(`((Principal|Secundaria)(?:.|\n)*?<br>)`)
	activity := activityReg.FindAllString(temp[Data[6]], -1)
	var allActivities []Activity
	if len(activity) > 0 {
		for _, val := range activity {
			nval := strings.TrimSuffix(val, "<br>")
			finalArray := strings.Split(nval, "-")
			var format string
			for i := range finalArray[2] {
				format += string(finalArray[2][i])
			}
			allActivities = append(allActivities, Activity{
				Order:  strings.TrimSpace(finalArray[0]),
				Number: strings.TrimSpace(finalArray[1]),
				Name:   strings.TrimSpace(format)})
		}
	}
	var valueHabido string
	if len(temp[Data[5]]) > 6 {
		valueHabido = "NO HABIDO"
	} else {
		valueHabido = temp[Data[5]]
	}

	var rb rucBody
	rb.Ruc = strings.TrimSpace(rucAndMore[0])
	if len(temp[Data[2]]) > 1 {
		rb.RazonSocial = temp[Data[2]]
	}
	rb.Estado = temp[Data[3]]
	rb.Condicion = valueHabido
	rb.Nombre = strings.TrimSpace(nombre)
	rb.ApellidoPaterno = strings.TrimSpace(apellidoPaterno)
	rb.ApellidoMaterno = strings.TrimSpace(apellidoMaterno)
	rb.DNI = dni
	if dir != "-" {
		rb.Direccion = dirOne
		rb.Departamento = subDir[len(subDir)-1]
		rb.Provincia = strings.TrimSpace(direccion[1])
		rb.Distrito = strings.TrimSpace(direccion[2])
	}
	rb.Actividades = allActivities
	return httpmessage.Send(rb)
}

type properties struct {
	Inicio string `json:"inicio"`
	Fin    string `json:"fin"`
	Moneda string `json:"moneda"`
}

func GetSbs(user *sts.Client, r *http.Request) (httpmessage.HttpMessage, error) {
	var body properties
	_ = utils.ParseBody(r, &body)
	host := fmt.Sprintf(`%s:%d`, config.Conf.FetchServer.Host, config.Conf.FetchServer.Port)
	conn, _ := grpc.Dial(host, grpc.WithInsecure())
	client := proto.NewAddServiceClient(conn)
	result, err := client.GetSbs(context.Background(), &proto.Request{
		Inicio: body.Inicio,
		Fin:    body.Fin,
		Moneda: body.Moneda})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	return httpmessage.Json(result.Result), nil
}
//APP
func GetApp(r *http.Request) httpmessage.HttpMessage {
	dom := utils.GetQuery(r, "d")

	if dom == nil {
		dom = ""
	}

	decode, err := base64.URLEncoding.DecodeString(dom.(string))
	if err != nil {
		httpmessage.Error(err)
	}
	dom = string(decode)
	client, conn, err := dialer.RouteClient()
	fmt.Println(dom)
	if nil != err {
		panic("Updater subscribe " + err.Error())
	}
	defer func() {
		err = conn.Close()
		if nil != err {
			log.Errorf("Connection close error %s", err.Error())
		}
	}()
	updater.Register(client, dom.(string))

	corporations := make([]responseCorporation, 0)

	for _, corp := range updater.Corporations {
		corporations = append(corporations, responseCorporation{
			Id:        corp.Id,
			Name:      corp.Name,
			Companies: corp.Companies,
			SubDomain: corp.SubDomain,
		})
	}

	return httpmessage.Send(&ResponseApp{
		Corporations: corporations,
		Languages:    updater.Languages,
	})
}

func AppTestController() {
	notify.Broadcast("Hola Mundo", notify.InfoType)
}

func AppTestController2(user *sts.Client, r *sts.HttpRequest, r2 *http.Request) {
	//r2.ParseMultipartForm(10 << 20)
	//file := r2.MultipartForm.File["imaj"]
	//for _, f := range file {
	//	fmt.Println(f.Size)
	//	fmt.Println(f.Header.Get("Content-Type"))
	//	fmt.Println(f.Filename)
	//	fmt.Println("---------")
	//}
	//data := r.GetBody()
	//fmt.Println(data)
	//fmt.Println("el file ....-->",files)
	//path := filepath.Join("D:/", "file", user.CompanyId)
	//logger.Debug(path)
	//body := r.GetBody()
	//img := body["img"].(string)
	//formato := body["format"].(string) // only
	//
	//dec, err := base64.StdEncoding.DecodeString(img)
	//if err != nil {
	//	logger.Debug(err)
	//}
	//// creando directorio si no existe
	//ok := filemanager.Exists(path)
	//if !ok {
	//	_ = os.MkdirAll(path, 0755)
	//}
	//f, err := os.Create(fmt.Sprintf(`%v/imgaj.%v`,path, formato))
	//if err != nil {
	//	logger.Debug(err)
	//}
	//defer f.Close()
	//if _, err = f.Write(dec); err != nil {
	//	logger.Debug(err)
	//}
	//if err = f.Sync(); err != nil {
	//	logger.Error()
	//}
}
