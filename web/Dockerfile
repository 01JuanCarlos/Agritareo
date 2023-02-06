### STAGE 1: Build ###
FROM node:14.17-alpine as builder

ENV HUSKY_SKIP_INSTALL=1
ENV NODE_OPTIONS=--max_old_space_size=4096
ARG CI_COMMIT_SHA
ARG CI_COMMIT_TAG


# Establecer directorio de trabajo
WORKDIR /app/build

# Copiar archivos necesarios para la instalacion de paquetes
COPY package.json package-lock.json ./

# Instalar los paquetes de npm
RUN npm ci

# Copiar codigo fuente
COPY . .

# Compilar paquetes
RUN ./node_modules/.bin/ngcc

# Crear directorio dist
RUN mkdir dist
RUN ls -la

# Compilar proyecto
RUN npm run build:prod
RUN ls -la
RUN sed -i "s/commit_hash = ''/commit_hash = '${CI_COMMIT_SHA}'/" dist/index.html
RUN sed -i "s/latest_version = ''/latest_version = '${CI_COMMIT_TAG}'/" dist/index.html
# RUN sed -i "s/build_date = ''/build_date = '$(date)'/" dist/index.html


### STAGE 2: Production stage ###
FROM nginx:1.21.1-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder  /app/build/dist /usr/share/nginx/html

