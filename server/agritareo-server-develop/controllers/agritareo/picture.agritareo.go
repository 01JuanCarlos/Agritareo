package agritareo

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	uuid "github.com/nu7hatch/gouuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/gridfs"
	"go.mongodb.org/mongo-driver/mongo/options"
	"io"
	"io/ioutil"
	"net/http"
	"ns-api/common/utils"
	"ns-api/config"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
	"ns-api/locale"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

type images struct {
	Ruta string `db:"ruta" json:"ruta"`
}

type img struct {
	Id   int    `db:"id" json:"id"`
	Path string `db:"ruta" json:"ruta"`
}

type MongoFields struct {
	Id   int
	Data []byte
}

type detailImage struct {
	Ruta string `json:"ruta"`
	Uuid string `json:"uuid"`
}

func CreateImage(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	err := r.ParseMultipartForm(10 * 1024 * 1024)
	if err != nil {
		return httpmessage.Error(err)
	}
	files := r.MultipartForm.File["file"]
	var di []detailImage
	if len(files) == 0 {
		return httpmessage.Error(locale.DocumentNotFound, "no se encontraron imagenes.")
	}
	for _, file := range files {
		fmt.Println("FILE NAME", file.Filename)
		fmt.Println("file size", file.Size)
		fmt.Println("file type", file.Header.Get("Content-Type"))
		if file.Size > 2000000 {
			return httpmessage.Error(locale.ValidationError, fmt.Sprintf("La imagen '%v' supera los 2mb", file.Filename))
		}
		f, _ := file.Open()
		fileBytes, err := ioutil.ReadAll(f)
		if err != nil {
			fmt.Println(err)
		}
		client := user.NoSql.Collection(user.ConnectionId, "")
		database := client.Database()

		bucket, _ := gridfs.NewBucket(
			database,
		)

		name, _ := uuid.NewV4()
		key := strings.ToUpper(fmt.Sprintf(`%v`, name))
		up, _ := bucket.OpenUploadStream(
			key,
		)
		defer up.Close()
		_, _ = up.Write(fileBytes)
		d := base64.StdEncoding.EncodeToString([]byte(user.NoSql.Database + "_" + user.NoSql.Id))
		origin := mode(false)
		uri := fmt.Sprintf("%v/v1/show-images?key=%v&d=%v", origin, key, d)
		di = append(di, detailImage{
			Ruta: uri,
			Uuid: key,
		})

	}
	return httpmessage.Send(di)
}

func GeImage(w http.ResponseWriter, r *http.Request) httpmessage.HttpMessage {
	key := utils.GetQuery(r, "key", "").(string)
	db := utils.GetQuery(r, "d", "").(string)
	//host := fmt.Sprintf(`%s`, config.Conf.FetchServer.Host)
	//host := "45.61.53.42"
	//chain := fmt.Sprintf(`mongodb://nisira:nisira.123!@%v:27017`, host) // mongodb://localhost:27017}
	chain := `mongodb://agritareo:admin2021.rar@134.209.170.209:27017`

	//rs := base64.StdEncoding.EncodeToString([]byte("AGRITAREO2_00003"))
	db2, err := base64.StdEncoding.DecodeString(db)
	if err != nil {
		return httpmessage.Error(err)
	}
	println(string(db2))
	client, err := mongo.Connect(r.Context(), options.Client().ApplyURI(chain))
	if err != nil {
		return httpmessage.Error(err)
	}
	defer client.Disconnect(r.Context())
	database := client.Database(string(db2))
	//fsfiles := database.Collection("fs.files")
	//ctx, _ := context.WithTimeout(context.Background(), 10*time.Second) //return httpmessage.Stream([]byte{}, "image/jpeg")
	//var result bson.M
	//err = fsfiles.FindOne(ctx, bson.M{}).Decode(&result)
	//if err != nil {
	//	return httpmessage.Error(err)
	//}
	//fmt.Println(result)
	buk, err := gridfs.NewBucket(
		database,
	)
	if err != nil {
		return httpmessage.Error(err)
	}
	var buf bytes.Buffer
	_, err = buk.DownloadToStreamByName(key, &buf)
	if err != nil {
		return httpmessage.Error(err)
	}
	w.Header().Set("Content-Type", "image/jpeg")
	rx := bytes.NewReader(buf.Bytes())
	_, err = io.Copy(w, rx)
	if err != nil {
		return httpmessage.Error(err)
	}
	return httpmessage.Stream([]byte{}, "image/jpeg")
}

func mode(m bool) string {
	if m {
		return "http://localhost:8002"
	}
	//host := fmt.Sprintf(`%s`, config.Conf.FetchServer.Host)
	//host := "45.61.53.42"
	uri := "https://api.nisiracloud.com.pe"
	fmt.Println(uri)
	return uri
}

func GetImages(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	id := utils.GetQuery(r, "id")   // centrocosto
	idn := utils.GetQuery(r, "idn") // 1-0
	origin := mode(config.IsDevMode)
	if id == nil || idn == nil {
		return httpmessage.Error(locale.ValidationError, "Insuficientes parametros.")
	}
	iidn, _ := strconv.Atoi(idn.(string))
	if iidn < 1 || iidn > 2 {
		return httpmessage.Error(locale.ValidationError, "Parametros incorrectos.")
	}

	//var body []images
	var body []img
	err := user.Sql.SelectProcedure(&body, "IMAGEN_L", user.CompanyId, id, idn)
	if err != nil {
		return httpmessage.Error(err)
	}
	//var finalImg []img
	fmt.Println(body)
	for i, j := range body {
		re := regexp.MustCompile("[^\\/](ns.+)")
		match := re.FindStringSubmatch(j.Path)
		nameImg := match[1]
		body[i].Path = fmt.Sprintf("%v/v1/image?c=%v&i=%v", origin, user.CompanyId, nameImg)
		//images = append(images, fmt.Sprintf("%v/v1/image?c=%v&i=%v", origin, user.CompanyId, nameImg))
		// images["url"] = fmt.Sprintf("http://localhost:8002/v1/images/%v", nameImg)
	}
	return httpmessage.Send(body)
}

func GeImageDetail(w http.ResponseWriter, r *http.Request) httpmessage.HttpMessage {
	name := utils.GetQuery(r, "i", "").(string)
	c := utils.GetQuery(r, "c", "").(string)
	if name == "" || c == "" {
		return httpmessage.Error("data required")
	}
	path := filepath.Join(config.WorkingDirectory, "images", c, name)
	fmt.Println(path)
	file, _ := os.Open(path)
	defer file.Close()
	w.Header().Set("Content-Type", "image/jpeg")
	io.Copy(w, file)

	return httpmessage.Stream([]byte{}, "image/jpeg")
}

////////////////////
func DeleteImage(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	// required values i, k
	//id := utils.GetQuery(r, "i", "0").(string)
	//value, _ := strconv.Atoi(id)
	//
	//origin := config.WorkingDirectory
	//if value != 0 {
	//	// delete one image
	//	var body []images
	//	err := user.Sql.Select(&body, fmt.Sprintf(`
	//	SELECT ruta from %v WHERE id = %v`, constants.TIMAGEN, value))
	//	if err != nil {
	//		return httpmessage.Error(err)
	//	}
	//	if len(body) > 0 {
	//		path := filepath.Join(origin, body[0].Ruta)
	//		err = os.Remove(path)
	//		if err != nil {
	//			return httpmessage.Error(err)
	//		}
	//		_, err = user.Sql.Query(constants.Delete(constants.TIMAGEN, value))
	//		if err != nil {
	//			return httpmessage.Error(err)
	//		}
	//		return httpmessage.Log(id)
	//	}
	//	return httpmessage.Error("No existen registros coincidentes")
	//}
	//// drop all
	//
	//key := utils.GetQuery(r, "k", "0").(string)
	//keyInt, _ := strconv.Atoi(key)
	//
	//if keyInt != 0 {
	//	idTables := map[int]string{
	//		1: "idevaluacion",
	//		2: "idcentrocosto",
	//	}
	//	idt := idTables[keyInt]
	//	//aid := utils.GetIntVar(r, "a")//another id
	//
	//	aid := utils.GetQuery(r, "a", "0").(string)
	//	aidInt, _ := strconv.Atoi(key)
	//	if aidInt == 0 {
	//		return httpmessage.Error("key required") // cambiar mensaje
	//	}
	//
	//	var body []images
	//	err := user.Sql.Select(&body, fmt.Sprintf(`
	//	SELECT ruta from %v WHERE %v = %v`, constants.TIMAGEN, idt, aid))
	//	if err != nil {
	//		return httpmessage.Error(err)
	//	}
	//
	//	for _, i := range body {
	//		path := filepath.Join(origin, i.Ruta)
	//		err = os.Remove(path)
	//		if err != nil {
	//			return httpmessage.Error(err)
	//		}
	//	}
	//	_, err = user.Sql.Query(fmt.Sprintf(`
	//DELETE FROM %v WHERE %v = %v`, constants.TIMAGEN, idt, aid))
	//	if err != nil {
	//		return httpmessage.Error(err)
	//	}
	//	return httpmessage.Log(aid)
	//}
	//
	//return httpmessage.Error("key required")

	id := utils.GetIntVar(r, "id")
	client := user.NoSql.Collection(user.ConnectionId, "")
	db := client.Database()

	res := db.Collection("fs.files").FindOne(context.TODO(), bson.M{"filename": id})
	if res != nil {
		rx, err := res.DecodeBytes()
		if err != nil {
			return httpmessage.Error("imagen no encontrada")
		}
		nid := rx.Index(0).Value().ObjectID()
		_, err = db.Collection("fs.files").DeleteOne(context.TODO(), bson.M{"_id": nid})
		if err != nil {
			fmt.Println("error fs-files")
		}
		_, err = db.Collection("fs.chunks").DeleteOne(context.TODO(), bson.M{"files_id": nid})
		if err != nil {
			fmt.Println("error fs-chunks")
		}
	}
	return httpmessage.Empty()
}

