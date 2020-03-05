#!/bin/bash

## SHELL BOILERPLATE STARTS HERE. DONT TOUCH ANYTHING INCLUDING THESE COMMENTS, ONLY EDIT THROUGH NODE SCRIPT

## You can update all the files by running 'node scripts/update-shell-script-boilerplate.js'.
## This will also update the filepaths in case you move any files to different directories

# region Boilerplate

set -e

ROOT_DIRECTORY=$(dirname "${BASH_SOURCE[0]}")/..
cd $ROOT_DIRECTORY

# We want relative paths for docker commands specifically and since we use cd relative paths work
DIRECTORY=scripts
ROOT_DIRECTORY=.


run_command_in_docker_with_write_access () {
    docker run --rm --mount "type=bind,source=$(pwd),target=/app,consistency=consistent" publisher-base "$@"
}

run_command_in_docker_with_colors_and_ctrl_c_capabilites () {
    docker run --rm -it publisher-base "$@"
}

run_command_in_docker () {
    docker run --rm publisher-base "$@"
}

run_docker_compose_command () {
    docker-compose -f config/docker/local-dev/docker-compose.yml "$@"
}

build_docker_image () {
    docker build -t publisher-base -f config/docker/local-dev/Dockerfile ./
}
# endregion

## SHELL BOILERPLATE STOPS HERE. FEEL FREE TO EDIT ANYTHING BELOW THIS COMMENT

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${YELLOW}Building Docker Container ${NC}"
echo ""

build_docker_image

echo ""
echo -e "${YELLOW}Build Complete. Starting linting (with auto fix, this may change your code):"
echo ""

sleep 0.5

# The red at the end will make any errors output by the command be red. And it only writes anything to console if there are errors
echo -n -e "Beginning Eslint linting ... ${RED}"

run_command_in_docker_with_write_access $DIRECTORY/helpers-linting/eslint.sh --fix

echo -e "${GREEN}PASSED"
echo ""
sleep 1

echo -e "${YELLOW}Beginning Prettier formatting ... ${CYAN}"
echo ""

run_command_in_docker_with_write_access $DIRECTORY/helpers-linting/prettier.sh --write

echo ""
echo -e "${GREEN}PASSED"
echo ""
sleep 1

echo -n -e "${YELLOW}Beginning Typescript type checking ... ${RED}"

run_command_in_docker_with_write_access $DIRECTORY/helpers-linting/typescript.sh --noEmit

echo -e "${GREEN}PASSED"
sleep 1

echo ""
echo -e "${GREEN}ALL PASSED!${NC}" # The last NC stop for example git push after precommit hook from being green
