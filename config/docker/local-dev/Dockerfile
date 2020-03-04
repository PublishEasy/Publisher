# Node 12 is the latest LTS version
# Alpine is just a small base image which is nice to have
FROM node:12-alpine

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn --frozen-lockfile

# See .dockerignore for which files we don't include
COPY . .
