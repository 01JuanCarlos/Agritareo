package validator

import (
	"encoding/json"
	"fmt"
	"github.com/go-playground/validator/v10"
	"github.com/go-playground/validator/v10/non-standard/validators"
	"ns-api/config"
	"ns-api/core/cache"
	"ns-api/core/filemanager"
	"ns-api/core/sts"
	"ns-api/modules/log"
	"path/filepath"
	"reflect"
	"regexp"
	"strings"
	"time"
)

const SAVE_CACHE = true


func Validate(st interface{}) (bool, []sts.ValidateError) {
	_validator := validator.New()
	_ = _validator.RegisterValidation("notBlank", validators.NotBlank)
	_validationErrors := _validator.Struct(st)
	var errors []sts.ValidateError

	if nil != _validationErrors {
		_stval := reflect.TypeOf(st)
		errors = make([]sts.ValidateError, 0)
		for _, e := range _validationErrors.(validator.ValidationErrors) {
			field, found := _stval.FieldByName(e.StructField())
			fieldName := strings.SplitN(field.Tag.Get("json"), ",", 2)[0]

			if !found || "-" == fieldName {
				fieldName = ""
			}

			errors = append(errors, sts.ValidateError{
				Field: fieldName,
				Tag:   e.Tag(),
				Name:  e.StructField(),
			})
		}
	}

	return nil == _validationErrors, errors
}

func ValidateVars(id string, payload *sts.Client, form sts.Body) (errors []sts.ValidateError) {
	_val := validator.New()
	_ = _val.RegisterValidation("notBlank", validators.NotBlank)
	errors = make([]sts.ValidateError, 0)
	var validators map[string]string

	validatorKey := fmt.Sprintf(`%v_%v_%v.json`, payload.CorporationId, payload.CompanyId, id)

	// todo: implementar SAVE_CACHE validando la existencia de los archivos.
	// fixme: Validar la exitencia del archivo de empresa
	if entry, err := cache.Get(validatorKey); nil == err {
		_ = json.Unmarshal(entry, &validators)
	} else {
		validatorKey = fmt.Sprintf(`%v.json`, id)
		if entry, err := cache.Get(validatorKey); nil == err {
			_ = json.Unmarshal(entry, &validators)
		}
	}

	validatorFile := filepath.Join(config.WorkingDirectory, "validators", validatorKey)

	if len(validators) > 0 || filemanager.Exists(validatorFile) {
		//var form map[string]interface{}

		if 0 == len(validators) {
			if err := filemanager.ReadJsonFile(validatorFile, &validators); nil != err {
				log.Error("falló cargando el archivo validator")
				return
			}

			buf, bufError := json.Marshal(validators)

			if SAVE_CACHE && nil == bufError && 0 < len(buf) {
				err := cache.Set(validatorKey, buf)
				if nil != err {
					log.Error("No se puede guardar el validador en caché.")
				}
			}
		}

		//if err := json.Unmarshal(body, &form); nil != err {
		//	log.Error("Error formateando el cuerpo de la solicitud")
		//	return
		//}

		for k, v := range validators {
			value, ok := form[k]
			if v != "-" && ok {
				if value == nil {
					value = ""
				}
				req := strings.HasPrefix(v, "required")
				formatValue := fmt.Sprintf(`%v`, value)
				if len(formatValue) != 0 || req {
					err := _val.Var(value, v)
					if nil != err {
						errors = append(errors, sts.ValidateError{
							Field: k,
							Tag:   v,
							Name:  k,
						})
					}
				}
			}
		}
	}

	return errors
}

func FormatDateFail(dateFail ...interface{}) (result bool, err2 error) {
	for _, value := range dateFail {
		if value != nil {
			re := regexp.MustCompile("((19|20)\\d\\d)/(0?[1-9]|1[012])/(0?[1-9]|[12]\\d|3[01])")
			if !re.MatchString(value.(string)) {
				//err2 = fmt.Errorf("Formato de fechas incorrecto.")
				//return
				_, err := time.Parse(time.RFC3339, value.(string))
				if err != nil {
					err2 = fmt.Errorf("Formato de fechas incorrecto.")
					return
				}
			}
		}
	}

	return true, nil
}
