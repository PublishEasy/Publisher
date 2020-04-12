# Node 12 is the latest LTS version
# Alpine is just a small base image which is nice to have
FROM node:12-alpine AS builder

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn --frozen-lockfile

COPY src src
COPY tsconfig.json tsconfig.json

RUN ./node_modules/.bin/tsc

COPY config/webpack config/webpack
COPY .browserslistrc .browserslistrc
COPY public public

RUN ./node_modules/.bin/webpack --config config/webpack/production-config.ts

# Build production dependencies
FROM node:12-alpine AS dependency-builder

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn --frozen-lockfile --prod


# Build final lean production image
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

COPY --from=dependency-builder /app/node_modules node_modules
COPY --from=builder /app/dist dist
COPY --from=builder /app/public public
