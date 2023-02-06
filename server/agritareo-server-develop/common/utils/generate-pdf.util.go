package utils

import (
	"ns-api/core/filemanager"
)

func GeneratePDF(data []byte) (tmpId string, err error) {
	return filemanager.SavePdfFile(data)
}
