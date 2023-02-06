set APP_ENV=dev

setlocal
echo Desplegando a producción! :D
cls
::cmd /c "cd /d src && go build"

::scp -i ./id_rsa.pem src/ns-api.exe nisiraweb@69.64.74.204:/D:/ERPWEB/ns-api.exe

ssh -i ./id_rsa.pem nisiraweb@69.64.74.204 "taskkill /F /IM ns-api.exe"
::ssh -i ./id_rsa.pem nisiraweb@69.64.74.204 "cmd /c D:/ERPWEB/src/ns-api.exe"

ssh -i ./id_rsa.pem nisiraweb@69.64.74.204 "C:\PSTools\PsExec64 -l -d D:\ERPWEB\src\ns-api.exe"
