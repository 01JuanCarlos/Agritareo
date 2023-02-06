FROM golang:1.15-alpine as builder

RUN apk add --no-cache git

ARG CI_JOB_TOKEN
ARG CI_JOB_USER

# Variable de entorno necesaria para la descargar de paquetes privados
ENV GOPRIVATE=gitlab.com/ns-desarrollo-web/agritareo/*

WORKDIR /build

RUN echo -e "machine gitlab.com login ${CI_JOB_USER} password ${CI_JOB_TOKEN}" > ~/.netrc

# Copiar y descargar las dependencias usando go mod
COPY go.mod .
COPY go.sum .
RUN go mod download

# Copiar el codigo en el contenedor
COPY . .

# Contruir la aplicación
RUN go build -o ns-app .

# Mover al directorio dist y copiar binario
WORKDIR /dist
RUN cp /build/ns-app .
###### small image #####

FROM alpine:latest

COPY --from=builder /dist/ns-app /etc/nisira/ns-app
COPY --from=builder /build/config.prod.toml /config.prod.toml

#EXPOSE 8000

#CMD ["/app"]
