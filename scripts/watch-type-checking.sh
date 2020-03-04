#!/bin/bash

set -e

DIRECTORY=$(realpath $(dirname ${BASH_SOURCE[0]}))
ROOT_DIRECTORY=$($DIRECTORY/helpers/get-root-directory.sh)

cd $ROOT_DIRECTORY

DIRECTORY=./$(realpath --relative-to=$ROOT_DIRECTORY $DIRECTORY)
ROOT_DIRECTORY=.

docker build -t publisher-base -f config/docker/local-dev/Dockerfile ./

docker run --rm -it publisher-base $DIRECTORY/helpers-linting/typescript.sh --watch --noEmit
