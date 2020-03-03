import { NULL_WEBPACK_CONFIG, WebpackConfig } from './constants-types-paths';
import { setupCoreFunctionality } from './core-config-builders';
import { setupUnoptimizedConvenientDevConfig } from './local-dev-config-builders';

const config: WebpackConfig = setupUnoptimizedConvenientDevConfig(
  setupCoreFunctionality(NULL_WEBPACK_CONFIG),
);
// Webpack needs the default export
// eslint-disable-next-line import/no-default-export
export default config;
