#!/bin/bash

## SHELL BOILERPLATE STARTS HERE. DONT TOUCH ANYTHING INCLUDING THESE COMMENTS, ONLY EDIT THROUGH NODE SCRIPT

## You can update all the files by running 'node scripts/update-shell-script-boilerplate.js'.
## This will also update the filepaths in case you move any files to different directories

# region boilerplate

set -e

ROOT_DIRECTORY=$(dirname "${BASH_SOURCE[0]}")/../..
cd $ROOT_DIRECTORY

# We want relative paths for docker commands specifically and since we use cd relative paths work
DIRECTORY=scripts/helpers-linting
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

./node_modules/.bin/eslint \
--config ./config/linting/.eslintrc.js \
--ignore-path .gitignore \
--ext .ts,.tsx,.js,.jsx \
--max-warnings 0 \
"$@" \
./
