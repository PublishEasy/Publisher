#!/bin/bash

set -e

DIRECTORY=$(realpath $(dirname ${BASH_SOURCE[0]}))
ROOT_DIRECTORY=$($DIRECTORY/helpers/get-root-directory.sh)

cd $ROOT_DIRECTORY

DIRECTORY=./$(realpath --relative-to=$ROOT_DIRECTORY $DIRECTORY)
ROOT_DIRECTORY=.

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

run_command_in_docker () {
    docker run --mount "type=bind,source=$(pwd),target=/app" publisher-base "$@"
}

echo -e "${YELLOW}Building Docker Container ${NC}"
echo ""

docker build -t publisher-base -f config/docker/local-dev/Dockerfile ./

echo ""
echo -e "${YELLOW}Build Complete. Starting linting (with auto fix, this may change your code):"
echo ""

sleep 0.5

echo -n -e "Beginning Eslint linting ... ${RED}" # The red at the end will make any errors output by the command be red. And it only writes anything to console if there are errors

run_command_in_docker $DIRECTORY/helpers-linting/eslint.sh --fix

echo -e "${GREEN}PASSED"
echo ""
sleep 1

echo -e "${YELLOW}Beginning Prettier formatting ... ${CYAN}"
echo ""

run_command_in_docker $DIRECTORY/helpers-linting/prettier.sh --write

echo ""
echo -e "${GREEN}PASSED"
echo ""
sleep 1

echo -n -e "${YELLOW}Beginning Typescript type checking ... ${RED}"

run_command_in_docker $DIRECTORY/helpers-linting/typescript.sh

echo -e "${GREEN}PASSED"
sleep 1

echo ""
echo -e "${GREEN}ALL PASSED!"
