package config

import (
	"fmt"
	"github.com/BurntSushi/toml"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

const APP_ENV = "APP_ENV"
const SESSION_DIRECTORY = "sessions"

var IsDevMode bool
var WorkingDirectory string
var TemporalDirectory string

type apiConfig struct {
	Version          string
	SessionDirectory string `toml:"session_dir"`
	TempPrefix       string `toml:"temp_prefix"`
	TempPdf          string `toml:"temp_pdf"`
	PythonBin        string `toml:"python_bin"`
	ReportFle        string `toml:"report_file"`
	ExpireSession    int    `toml:"expire_session"`
}

type fetchServer struct {
	Host string `toml:"host"`
	Port int    `toml:"port"`
}

type httpServer struct {
	Host    string   `toml:"host"`
	Port    int      `toml:"port"`
	Origins []string `toml:"origins"`
}

type databaseConnection struct {
	Host     string `toml:"host"`
	Port     int    `toml:"port"`
	User     string `toml:"user"`
	Password string `toml:"password"`
	Instance string `toml:"instance"`
}

type databaseSql struct {
	Prefix     string             `toml:"prefix"`
	Schema     string             `toml:"schema"`
	Enabled    bool               `toml:"enabled"`
	Connection databaseConnection `toml:"connection"`
}

type databaseNoSql struct {
	Enabled    bool               `toml:"enabled"`
	Connection databaseConnection `toml:"connection"`
}

type database struct {
	Sql   databaseSql   `toml:"sql"`
	NoSql databaseNoSql `toml:"nosql"`
}

type config struct {
	Id          string      `toml:"id"`
	Title       string      `toml:"title"`
	Api         apiConfig   `toml:"api"`
	FetchServer fetchServer `toml:"fetch_server"`
	HttpServer  httpServer  `toml:"http_server"`
	Database    database    `toml:"database"`
}

var Conf config

func init() {
	var err error

	if WorkingDirectory, err = os.Getwd(); nil != err {
		panic(fmt.Sprintf("config[BaseDir]: %s", err.Error()))
	}

	environment := os.Getenv(APP_ENV)
	IsDevMode = environment == "dev" || environment == "development"

	if _, err := toml.DecodeFile(getConfigFileName(), &Conf); nil != err {
		panic("Error loading configuration file: " + err.Error())
	}

	if TemporalDirectory, err = ioutil.TempDir(os.TempDir(), Conf.Api.TempPrefix); nil != err {
		panic("config[TemporalDirectory]: " + err.Error())
	}

	if "" == Conf.Api.SessionDirectory {
		Conf.Api.SessionDirectory = SESSION_DIRECTORY
	}

	createWorkingDirectories()
}

func getConfigFileName() string {
	postFix := "dev"

	if !IsDevMode {
		postFix = "prod"
	}

	filename := []string{"config", postFix, "toml"}
	filePath := filepath.Join(WorkingDirectory, strings.Join(filename, "."))
	return filePath
}

func createWorkingDirectories() {
	if err := os.MkdirAll(filepath.Join(TemporalDirectory, Conf.Api.TempPdf), 0755); nil != err {
		panic("Create pdf directory: " + err.Error())
	}

	sessionDir := filepath.Join(TemporalDirectory, Conf.Api.SessionDirectory)

	if _, err := os.Stat(sessionDir); os.IsNotExist(err) {
		if err = os.Mkdir(sessionDir, 0755); err != nil {
			panic("Cannot create sessions directory")
		}
	}
}
