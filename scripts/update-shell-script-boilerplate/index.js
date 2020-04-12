// This is a dev only script so we can import a dev dependency
// eslint-disable-next-line import/no-extraneous-dependencies
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const ROOT_DIRECTORY_PATH = require('./get-root-path');

const SCRIPTS_FOLDER_NAME = 'scripts';

glob(
  path.resolve(ROOT_DIRECTORY_PATH, SCRIPTS_FOLDER_NAME, '**/*.sh'),
  {},
  (err, files) => {
    if (err) {
      console.err(err);
      return;
    }
    files.forEach(updateScriptBoilerplate);
  },
);

function updateScriptBoilerplate(filePath) {
  const file = fs.readFileSync(filePath, 'utf-8');
  const lines = file.split('\n');
  let newLines;
  if (lines.length <= 2) {
    newLines = getNewFileLines(filePath);
  } else {
    assertCorrectFileStart(lines, filePath);
    newLines = getUpdatedBoilerplateLines(lines, filePath);
  }
  const newFile = newLines.join('\n');
  fs.writeFileSync(filePath, newFile);
}

function getNewFileLines(filePath) {
  return ['#!/bin/bash', '', ...getBoilerplateLinesForFilePath(filePath)];
}

function getUpdatedBoilerplateLines(lines, filePath) {
  const {
    boilerplateStartIndex,
    boilerplateEndIndex,
  } = findBoilerplateLineIndices(lines, filePath);
  const endThatExcludesStartIndicator = boilerplateStartIndex;
  const startThatExcludesEndIndicator = boilerplateEndIndex + 1;
  return [
    ...lines.slice(0, endThatExcludesStartIndicator),
    ...getBoilerplateLinesForFilePath(filePath),
    ...lines.slice(startThatExcludesEndIndicator),
  ];
}

/**
 * If you want to change an indicator, change the one without OLD prefix, run the script,
 * then change old one and then all indicators will be changed and future script runs will work perfectly
 */
const OLD_START_INDICATOR =
  '## SHELL BOILERPLATE STARTS HERE. DONT TOUCH ANYTHING INCLUDING THESE COMMENTS, ONLY EDIT THROUGH NODE SCRIPT';
const START_INDICATOR = OLD_START_INDICATOR;
const OLD_END_INDICATOR =
  '## SHELL BOILERPLATE STOPS HERE. FEEL FREE TO EDIT ANYTHING BELOW THIS COMMENT';
const END_INDICATOR = OLD_END_INDICATOR;

function assertCorrectFileStart(lines, filePath) {
  if (
    lines[0] !== '#!/bin/bash' ||
    lines[1] !== '' ||
    lines[2] !== START_INDICATOR
  ) {
    throw new Error(
      `${filePath} did not start with #!/bin/bash followed by an empty line and then the boilerplate. Beginning lines were\n${JSON.stringify(
        lines.slice(0, 3),
      )}`,
    );
  }
}

function findBoilerplateLineIndices(lines, filePath) {
  const boilerplateStartIndex = lines.findIndex(
    (x) => x === OLD_START_INDICATOR,
  );
  const boilerplateEndIndex = lines.findIndex((x) => x === OLD_END_INDICATOR);
  if (boilerplateStartIndex === -1)
    throw new Error(`${filePath} did not have the start indicator`);
  if (boilerplateEndIndex === -1)
    throw new Error(`${filePath} did not have the end indicator`);
  return { boilerplateStartIndex, boilerplateEndIndex };
}

function getBoilerplateLinesForFilePath(filePath) {
  return [
    START_INDICATOR,
    ...buildBoilerplateContentForPath(filePath).split('\n'),
    END_INDICATOR,
  ];
}

function buildBoilerplateContentForPath(filePath) {
  const getPathFromContextToFilePath = '$(dirname "${BASH_SOURCE[0]}")';
  const fileDirectory = path.dirname(filePath);
  const fileDirectoryRelativeToRoot = path.relative(
    ROOT_DIRECTORY_PATH,
    fileDirectory,
  );
  const pathFromFileToRoot = path.relative(fileDirectory, ROOT_DIRECTORY_PATH);
  return `\

## You can update all the files by running 'node scripts/update-shell-script-boilerplate.js'.
## This will also update the filepaths in case you move any files to different directories

# region boilerplate

set -e

ROOT_DIRECTORY=${getPathFromContextToFilePath}/${pathFromFileToRoot}
cd $ROOT_DIRECTORY

# We want relative paths for docker commands specifically and since we use cd relative paths work
DIRECTORY=${fileDirectoryRelativeToRoot}
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
`;
}
