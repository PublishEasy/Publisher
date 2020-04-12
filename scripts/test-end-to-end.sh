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

run_docker_compose_command () {
    docker-compose -f config/docker/local-dev/docker-compose.yml "$@"
}

build_docker_image () {
    docker build -t publisher-base -f config/docker/local-dev/Dockerfile ./
}
# endregion

## SHELL BOILERPLATE STOPS HERE. FEEL FREE TO EDIT ANYTHING BELOW THIS COMMENT

PROD_COMPOSE_FILE=config/docker/production/docker-compose.yml
E2E_tests_docker_path=/e2e-tests

mkdir -p end-to-end-screenshots

teardown() {
    docker-compose -f $PROD_COMPOSE_FILE down
}

docker-compose -f $PROD_COMPOSE_FILE up --build --detach

(docker run \
    --mount "type=bind,source=$(pwd)/src/__tests__/end-to-end,target=$E2E_tests_docker_path" \
    --mount "type=bind,source=$(pwd)/end-to-end-screenshots,target=/end-to-end-screenshots" \
    --net=host \
    -it \
    testcafe/testcafe \
    "firefox:headless,chromium:headless" \
    $E2E_tests_docker_path/*.testcafe.ts \
    --screenshots takeOnFails=true,path=/end-to-end-screenshots) \
    || (teardown && exit 1)

teardown
