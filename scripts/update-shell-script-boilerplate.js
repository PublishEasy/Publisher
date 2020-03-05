/* eslint-disable */

const path = require('path');
const glob = require('glob');
const fs = require('fs');

glob(path.resolve(__dirname, '**/*.sh'), {}, (err, files) => {
  if (err) {
    console.err(err);
    return;
  }
  files.forEach(updateScriptBoilerplate);
});

const OLD_START_INDICATOR =
  '## SHELL BOILERPLATE STARTS HERE. DONT TOUCH ANYTHING INCLUDING THESE COMMENTS, ONLY EDIT THROUGH NODE SCRIPT';
// Just change this if you want to change the indicator and then after running it will update the indicator, and you can change
// OLD_START_INDICATOR the new START_INDICATOR
const START_INDICATOR =
  '## SHELL BOILERPLATE STARTS HERE. DONT TOUCH ANYTHING INCLUDING THESE COMMENTS, ONLY EDIT THROUGH NODE SCRIPT';
const OLD_END_INDICATOR =
  '## SHELL BOILERPLATE STOPS HERE. FEEL FREE TO EDIT ANYTHING BELOW THIS COMMENT';
const END_INDICATOR =
  '## SHELL BOILERPLATE STOPS HERE. FEEL FREE TO EDIT ANYTHING BELOW THIS COMMENT';

function updateScriptBoilerplate(filePath) {
  const file = fs.readFileSync(filePath, 'utf-8');
  const lines = file.split('\n');
  const { boilerplateStartIndex, boilerplateEndIndex } = getIndices(
    lines,
    filePath,
  );
  const endThatExcludesStartIndicator = boilerplateStartIndex;
  const startThatExcludesEndIndicator = boilerplateEndIndex + 1;
  const newLines = [
    ...lines.slice(0, endThatExcludesStartIndicator),
    // This means we'll update to the new start (and end below) indicator if relevant
    START_INDICATOR,
    ...buildBoilerplateForFilePath(filePath).split('\n'),
    END_INDICATOR,
    ...lines.slice(startThatExcludesEndIndicator),
  ];
  const newFile = newLines.join('\n');
  fs.writeFileSync(filePath, newFile);
}

function getIndices(lines, filePath) {
  const boilerplateStartIndex = lines.findIndex(x => x === OLD_START_INDICATOR);
  const boilerplateEndIndex = lines.findIndex(x => x === OLD_END_INDICATOR);
  if (boilerplateStartIndex === -1)
    throw new Error(`${filePath} did not have the start indicator`);
  if (boilerplateEndIndex === -1)
    throw new Error(`${filePath} did not have the end indicator`);
  if (
    lines[0] !== '#!/bin/bash' ||
    lines[1] !== '' ||
    boilerplateStartIndex !== 2
  ) {
    throw new Error(
      `${filePath} did not start with #!/bin/bash followed by an empty line and then the boilerplate. Beginning lines were\n${JSON.stringify(
        lines.slice(0, 3),
      )}`,
    );
  }
  return { boilerplateStartIndex, boilerplateEndIndex };
}

const buildBoilerplateForFilePath = filePath => {
  const getPathFromContextToFilePath = '$(dirname "${BASH_SOURCE[0]}")';
  const rootDirectoryPath = path.resolve(__dirname, '..');
  const fileDirectory = path.dirname(filePath);
  const fileDirectoryRelativeToRoot = path.relative(
    rootDirectoryPath,
    fileDirectory,
  );
  const pathFromFileToRoot = path.relative(fileDirectory, rootDirectoryPath);
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
`;
};
