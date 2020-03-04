#!/bin/bash


set -e

DIRECTORY=$(dirname ${BASH_SOURCE[0]})
ROOT_DIRECTORY=$($DIRECTORY/helpers/get-root-directory.sh)

cd $ROOT_DIRECTORY

# Remove any previously stopped containers
docker-compose -f config/docker/local-dev/docker-compose.yml rm --force --stop

docker-compose -f config/docker/local-dev/docker-compose.yml up --build
