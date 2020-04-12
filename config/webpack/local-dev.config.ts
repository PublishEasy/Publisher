import { NULL_WEBPACK_CONFIG, WebpackConfig } from './constants-types-paths';
import { addWebClientCore } from './core-config-builders';
import { setupUnoptimizedConvenientDevConfig } from './local-dev-config-builders';

const config: WebpackConfig = setupUnoptimizedConvenientDevConfig(
  addWebClientCore(NULL_WEBPACK_CONFIG),
);
// Webpack needs the default export
// eslint-disable-next-line import/no-default-export
export default config;
