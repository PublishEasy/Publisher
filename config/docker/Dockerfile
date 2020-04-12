# Node 12 is the latest LTS version
# Alpine is just a small base image which is nice to have

#### This is the image we will use to run random commands inside in local dev and CI
FROM node:12-alpine AS local-dev

WORKDIR /app

RUN apk add --no-cache --upgrade bash
RUN apk add --no-cache --upgrade git

COPY ["package.json", "yarn.lock", "./"]

RUN yarn --frozen-lockfile

COPY scripts scripts
COPY config config
COPY src src
COPY [".browserslistrc", "tsconfig.json", "./"]

#### Here we build the code preparing it to be run in production
FROM node:12-alpine AS production-builder

WORKDIR /app

COPY --from=local-dev /app/node_modules node_modules

COPY src/server src/server
COPY src/common src/common
COPY config/webpack config/webpack
COPY tsconfig.json tsconfig.json

RUN ./node_modules/.bin/webpack --config config/webpack/server-production-config.ts

COPY src/client src/client
COPY .browserslistrc .browserslistrc
COPY public public

RUN ./node_modules/.bin/webpack --config config/webpack/web-client-production-config.ts

#### Build production dependencies
FROM node:12-alpine AS production-dependency-builder

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn --frozen-lockfile --prod


#### Build final lean production image
FROM alpine:3.11

WORKDIR /app

# Stolen and modified from https://github.com/nodejs/docker-node/blob/eb9bb348eec67c1c5682e06fdb93aa45e294aa26/12/alpine3.11/Dockerfile
ENV NODE_VERSION 12.16.2
ENV CHECKSUM f6b8bb0ee376cd1e7096f15b68efc3bb6adbd2cb33a12002d5982384b733dcab
ENV ARCH x64

RUN addgroup -g 1000 node \
    && adduser -u 1000 -G node -s /bin/sh -D node \
    && apk add --no-cache \
        libstdc++ \
    && apk add --no-cache --virtual .build-deps \
        curl \
    && set -eu; \
    curl -fsSLO --compressed "https://unofficial-builds.nodejs.org/download/release/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH-musl.tar.xz"; \
    echo "$CHECKSUM  node-v$NODE_VERSION-linux-$ARCH-musl.tar.xz" | sha256sum -c - \
      && tar -xJf "node-v$NODE_VERSION-linux-$ARCH-musl.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
      && ln -s /usr/local/bin/node /usr/local/bin/nodejs;

COPY --from=production-dependency-builder /app/node_modules node_modules
COPY --from=production-builder /app/dist dist
COPY --from=production-builder /app/public public
