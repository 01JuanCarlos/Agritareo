package logger

import (
	"fmt"
	"github.com/sirupsen/logrus"
	"ns-api/modules/log"
	"runtime"
)

var defaultFields logrus.Fields

func init() {
	defaultFields = logrus.Fields{
		"prefix": "api",
	}
}

func Info(args ...interface{}) {
	log.GetLogger(defaultFields).Info(args...)
}

func Infof(format string, args ...interface{}) {
	log.GetLogger(defaultFields).Infof(format, args...)
}

func Warn(args ...interface{}) {
	log.GetLogger(defaultFields).Warn(args...)
}

func Warnf(format string, args ...interface{}) {
	log.GetLogger(defaultFields).Warnf(format, args...)
}

// fixme: remover modo producción
func Error(args ...interface{}) {
	_, file, no, _ := runtime.Caller(1)
	message := fmt.Sprintf(`%s#%d: %s`, file, no, fmt.Sprint(args...))
	log.GetLogger(defaultFields).Error(message)
}

// fixme: remover modo producción
func Errorf(format string, args ...interface{}) {
	_, file, no, _ := runtime.Caller(1)
	message := fmt.Sprintf(format, args...)
	log.GetLogger(defaultFields).Errorf(`%s#%d: %s`, file, no, message)
}

func Panic(args ...interface{}) {
	log.GetLogger(defaultFields).Panic(args...)
}

func Panicf(format string, args ...interface{}) {
	log.GetLogger(defaultFields).Panicf(format, args...)
}

func Debug(args ...interface{}) {
	log.GetLogger(logrus.Fields{
		"prefix": "api",
		"type":   "debug",
	}).Warn(args...)
}

func Debugf(format string, args ...interface{}) {
	log.GetLogger(logrus.Fields{
		"prefix": "api",
		"type":   "debug",
	}).Warnf(format, args...)
}

func Struct(data interface{}) {
	fmt.Printf("%+v\n", data)
}
