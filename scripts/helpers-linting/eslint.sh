#!/bin/bash

set -e

DIRECTORY=$(dirname ${BASH_SOURCE[0]})
ROOT_DIRECTORY=$($DIRECTORY/../helpers/get-root-directory.sh)

cd $ROOT_DIRECTORY

./node_modules/.bin/eslint \
--config ./config/linting/.eslintrc.js \
--ignore-path .gitignore \
--ext .ts,.tsx,.js,.jsx \
--max-warnings 0 \
"$@" \
./
