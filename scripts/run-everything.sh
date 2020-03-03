#!/bin/bash


set -e

DIRECTORY=$(dirname ${BASH_SOURCE[0]})
ROOT_DIRECTORY=$($DIRECTORY/helpers/get-root-directory.sh)

cd $ROOT_DIRECTORY

docker-compose -f config/deployment/local-dev/docker-compose.yml up --build
