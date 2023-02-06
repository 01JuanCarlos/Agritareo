set APP_ENV=dev

setlocal
echo Iniciando modo desarrollo! :D
cls
cmd /c "go run main.go"
:protoc -I ./ proto/service.proto --go_out=plugins=grpc:.
:cmd /c "cd /d src && go run main.go -exec erpserver.exe"