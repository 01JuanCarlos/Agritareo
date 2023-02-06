package business

import (
	"archive/zip"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
)

func Read(r *http.Request, subPath, keyParam string) (file [][]byte, err error) {
	err = r.ParseMultipartForm(32 << 20)
	if err != nil {
		return nil, err
	}
	files := r.MultipartForm.File[keyParam]
	if len(files) == 0 {
		err = errors.New("archivo no encontrado")
		return nil, err
	}
	var data [][]byte
	for _, file := range files {
		name := file.Filename
		fmt.Println("FILE NAME", name)
		fmt.Println("file size", file.Size)
		fmt.Println("file type", file.Header.Get("Content-Type"))
		fmt.Println("-----------------------------------------")
		if file.Header.Get("Content-Type") != "application/octet-stream" {
			return nil, errors.New("formato de archivo incorrecto")
		}

		_, ok := FixedZip(name)
		if ok {
			//files[i].Filename = nameUpdated
			tmpDirk, err := ioutil.TempDir(os.TempDir(), "prefix-")
			fmt.Println(tmpDirk, err)
			if err != nil {
				fmt.Println(err)
			}
			f, _ := file.Open()
			temp, _ := ioutil.TempFile(tmpDirk, "ns-*.7z")
			fileBytes, _ := ioutil.ReadAll(f)
			_, err = temp.Write(fileBytes)
			if err != nil {
				return nil, err
			}
			_ = temp.Close()

			names, err := Unzip(temp.Name(), tmpDirk)
			if err != nil {
				return nil, err
			}

			// path kml
			zipPath := strings.Join(names, "\n")
			datazip, err := ioutil.ReadFile(zipPath)
			if err != nil {
				return nil, err
			}
			data = append(data, datazip)
			// remove temp
			_ = os.RemoveAll(tmpDirk)

		} else {
			if subPath == "images" {
				if file.Size > 2000000 {
					err = errors.New(fmt.Sprintf("El archivo '%v' supera los 2mb", file.Filename))
					return nil, err
				}
			}
			f, err := file.Open()

			if err != nil {
				return nil, err
			}

			fileBytes, err := ioutil.ReadAll(f)
			if err != nil {
				return nil, err
			}
			data = append(data, fileBytes)
		}

	}

	return data, nil
}

func FixedZip(fileName string) (string, bool) {
	ext := path.Ext(fileName)
	if ext != ".kmz" {
		return "", false
	}
	outfile := fileName[0:len(fileName)-len(ext)] + ".zip"
	return outfile, true
}

func Unzip(src, tmpDirk string) ([]string, error) {
	var filenames []string
	//	src := temp.Name()
	fmt.Println(src)
	r, _ := zip.OpenReader(src)
	defer r.Close()

	for _, f := range r.File {
		fpath := filepath.Join(tmpDirk, f.Name)
		filenames = append(filenames, fpath)
		if err := os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			return filenames, err
		}

		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return filenames, err
		}
		rc, err := f.Open()
		if err != nil {
			return filenames, err
		}
		_, err = io.Copy(outFile, rc)
		outFile.Close()
		rc.Close()
		if err != nil {
			return filenames, err
		}
	}
	return filenames, nil
}
