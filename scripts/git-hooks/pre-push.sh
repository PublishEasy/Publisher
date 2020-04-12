#!/bin/bash

## SHELL BOILERPLATE STARTS HERE. DONT TOUCH ANYTHING INCLUDING THESE COMMENTS, ONLY EDIT THROUGH NODE SCRIPT

## You can update all the files by running 'node scripts/update-shell-script-boilerplate.js'.
## This will also update the filepaths in case you move any files to different directories

# region boilerplate

set -e

ROOT_DIRECTORY=$(dirname "${BASH_SOURCE[0]}")/../..
cd $ROOT_DIRECTORY

# We want relative paths for docker commands specifically and since we use cd relative paths work
DIRECTORY=scripts/git-hooks
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

RED='\033[0;31m'
NC='\033[0m'

assert_no_unstaged_changes() {
    test -z "$(git diff-index --name-only HEAD --)" || (
        git add . &&
        echo -e "${RED}There are unstaged changes, possibly because this script autofixed some code style. 'git add .' has been run for you, please 'git commit --amend' or otherwise handle the unstaged changes before pushing again${NC}" &&
        exit 1
    )
}
./scripts/test-quick.sh &&
./scripts/lint-everything.sh &&
assert_no_unstaged_changes
