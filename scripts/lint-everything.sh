#!/bin/bash

## SHELL BOILERPLATE STARTS HERE. DONT TOUCH ANYTHING INCLUDING THESE COMMENTS, ONLY EDIT THROUGH NODE SCRIPT

## You can update all the files by running 'node scripts/update-shell-script-boilerplate.js'.
## This will also update the filepaths in case you move any files to different directories

# region boilerplate

set -e

ROOT_DIRECTORY=$(dirname "${BASH_SOURCE[0]}")/..
cd $ROOT_DIRECTORY

# We want relative paths for docker commands specifically and since we use cd relative paths work
DIRECTORY=scripts
ROOT_DIRECTORY=.


run_command_in_docker_with_write_access () {
    docker run --rm --mount "type=bind,source=$(pwd),target=/app,consistency=consistent" publisher-base "$@"
}

run_command_in_docker_with_colors_ctrl_c_capabilitiies_and_updating_file_system () {
    docker run --rm -it --mount "type=bind,source=$(pwd),target=/app,consistency=consistent" publisher-base "$@"
}

run_command_in_docker_with_colors () {
    docker run --rm -t publisher-base "$@"
}

run_command_in_docker_with_colors_and_write () {
    docker run --rm -t --mount "type=bind,source=$(pwd),target=/app,consistency=consistent" publisher-base "$@"
}

run_command_in_docker () {
    docker run --rm publisher-base "$@"
}

run_local_dev_docker_compose_command () {
    COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f config/docker/local-dev-compose.yml "$@"
}

run_production_docker_compose_command () {
    COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f config/docker/production-compose.yml "$@"
}

build_docker_image () {
    DOCKER_BUILDKIT=1 docker build -t publisher-base -f config/docker/Dockerfile --target local-dev ./
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

run_command_in_docker_with_write_access $DIRECTORY/pre-configured-commands/eslint.sh --fix

echo -e "${GREEN}PASSED"
echo ""
sleep 1

echo -e "${YELLOW}Beginning Prettier formatting ... ${CYAN}"
echo ""

run_command_in_docker_with_write_access $DIRECTORY/pre-configured-commands/prettier.sh --write

echo ""
echo -e "${GREEN}PASSED"
echo ""
sleep 1

echo -n -e "${YELLOW}Beginning Typescript type checking ... ${RED}"

run_command_in_docker_with_write_access $DIRECTORY/pre-configured-commands/typescript.sh --noEmit

echo -e "${GREEN}PASSED"
sleep 1

echo ""
echo -e "${GREEN}ALL PASSED!${NC}" # The last NC stop for example git push after precommit hook from being green
