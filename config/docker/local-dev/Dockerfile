# Node 12 is the latest LTS version
# Alpine is just a small base image which is nice to have
FROM node:12-alpine

WORKDIR /app

RUN apk add --no-cache --upgrade bash
RUN apk add --no-cache --upgrade git

COPY ["package.json", "yarn.lock", "./"]

RUN yarn --frozen-lockfile

# See .dockerignore for which files we don't include
COPY . .
