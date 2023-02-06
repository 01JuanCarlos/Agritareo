package log

import (
	"fmt"
	"github.com/sirupsen/logrus"
	"ns-api/config"
	"os"
	"path"
	"path/filepath"
	"time"
)

// Exported logger
var log = logrus.New()
var logger *logrus.Entry
var loggerFilename string
var file *os.File
var currentDir string

func init() {
	if config.IsDevMode {
		log.SetFormatter(&logrus.TextFormatter{
			ForceColors:               true,
			EnvironmentOverrideColors: true,
			FullTimestamp:             true,
			TimestampFormat:           "Jan _2 15:04",
		})
		//log.Level = logrus.DebugLevel
		//log.SetOutput(os.Stdout)
	} else {
		currentDir, _ = os.Getwd()
		currentDir = filepath.Join(currentDir, "log")

		if _, err := os.Stat(currentDir); os.IsNotExist(err) {
			if err = os.Mkdir(currentDir, 0755); err != nil {
				fmt.Println("Cannot create log directory")
			}
		}

		setOutputFile()
		log.SetFormatter(&logrus.JSONFormatter{})
	}

	logger = log.WithFields(logrus.Fields{
		"prefix": "core",
	})
}

func setOutputFile() {
	filename := fmt.Sprintf(`log-%s.log`, time.Now().String()[:10])
	if loggerFilename != filename && !config.IsDevMode {
		if nil != file {
			file.Close()
		}

		loggerFilename = filename
		var fileErr error

		file, fileErr = os.OpenFile(path.Join(currentDir, loggerFilename), os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0644)
		if fileErr != nil {
			fmt.Println("Unable to open log file")
			return
		}

		log.SetOutput(file)
	}
}

func GetLogger(args ...logrus.Fields) *logrus.Entry {
	if len(args) > 0 {
		return log.WithFields(args[0])
	}
	return log.WithFields(logrus.Fields{})
}

func Debug(args ...interface{}) {
	setOutputFile()
	log.Println(args...)
}

func Debugf(format string, args ...interface{}) {
	setOutputFile()
	log.Printf(format, args...)
}

func Info(args ...interface{}) {
	setOutputFile()
	logger.Info(args...)
}

func Infof(format string, args ...interface{}) {
	setOutputFile()
	logger.Infof(format, args...)
}

func Error(args ...interface{}) {
	setOutputFile()
	logger.Error(args...)
}

func Errorf(format string, args ...interface{}) {
	setOutputFile()
	logger.Errorf(format, args...)
}

func Warn(args ...interface{}) {
	setOutputFile()
	logger.Warn(args...)
}

func Warnf(format string, args ...interface{}) {
	setOutputFile()
	logger.Warnf(format, args...)
}

func Panic(args ...interface{}) {
	setOutputFile()
	logger.Panic(args...)
}

func Panicf(format string, args ...interface{}) {
	setOutputFile()
	logger.Panicf(format, args...)
}

func Fatal(args ...interface{}) {
	setOutputFile()
	logger.Fatal(args...)
}

func Fatalf(format string, args ...interface{}) {
	setOutputFile()
	logger.Fatalf(format, args...)
}
