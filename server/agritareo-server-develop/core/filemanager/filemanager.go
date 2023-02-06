package filemanager

import (
	"encoding/json"
	"fmt"
	uuid "github.com/nu7hatch/gouuid"
	"io/ioutil"
	"ns-api/config"
	"ns-api/modules/log"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

func Exists(path string) bool {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return false
	}
	return true
}

func ReadFile(path string) (buf []byte, err error) {
	var file *os.File
	defer file.Close()

	if file, err = os.Open(path); nil != err {
		return
	}

	return ioutil.ReadAll(file)
}

func ReadJsonFile(path string, st interface{}) error {
	buf, err := ReadFile(path)

	if nil != err {
		return err
	}
	err = json.Unmarshal(buf, st)
	return err
}

func ReadTempFile(id string) ([]byte, error) {
	return ReadFile(ResolveTempFile(id))
}

func ReadPdfFile(id string) ([]byte, error) {
	return ReadFile(ResolvePdfFile(id))
}

func SaveFile(path string, data []byte, perm ...interface{}) (err error) {
	var filePermissions os.FileMode = 0755

	if len(perm) > 0 {
		filePermissions = perm[0].(os.FileMode)
	}

	return ioutil.WriteFile(path, data, filePermissions)
}

func SaveTempFile(data []byte, perm ...interface{}) (string, error) {
	filename := fmt.Sprintf(`%v`, time.Now().Unix())
	id, err := uuid.NewV4()

	if nil == err {
		filename = id.String()
	}

	return filename, SaveFile(ResolveTempFile(filename), data, perm...)
}

func SavePdfFile(data []byte, perm ...interface{}) (id string, err error) {
	id, err = SaveTempFile(data)
	if err != nil {
		log.Errorf("SavePdfFile: %s", err.Error())
		return
	}

	log.Debug(config.Conf.Api.PythonBin, config.Conf.Api.ReportFle, config.TemporalDirectory, id)
	if response, err := exec.Command(config.Conf.Api.PythonBin, config.Conf.Api.ReportFle, config.TemporalDirectory, id).Output(); nil != err {
		log.Errorf("SavePdfFile[exec error]: %s", err.Error())
	} else if len(string(response)) > 0 {
		log.Warnf("SavePdfFile[script out]: %s", string(response))
	}

	return
}

func ResolvePath(args ...string) string {
	args = append([]string{config.TemporalDirectory}, args...)
	return filepath.Join(args...)
}

func ResolvePdfFile(id string) string {
	return filepath.Join(filepath.Join(config.TemporalDirectory, config.Conf.Api.TempPdf), fmt.Sprintf(`%v.pdf`, id))
}

func ResolveTempFile(id string) string {
	return ResolvePath(fmt.Sprintf(`%v.tmp`, id))
}

func RemoveTemp() {
	defer os.RemoveAll(config.TemporalDirectory)
}
