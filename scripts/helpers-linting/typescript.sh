#!/bin/bash

set -e

DIRECTORY=$(dirname ${BASH_SOURCE[0]})
ROOT_DIRECTORY=$($DIRECTORY/../helpers/get-root-directory.sh)

cd $ROOT_DIRECTORY

./node_modules/.bin/tsc "$@"
