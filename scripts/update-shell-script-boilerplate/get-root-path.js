/**
 * Getting the root directory path should not be coupled to anything else. Any script
 * that uses the root path should be able to move directory and still work (or at least fail with
 * import errors as opposed to runtime errors). So we extract it here
 */
/* eslint-disable */
const path = require('path');
module.exports = path.resolve(__dirname, '../../');
