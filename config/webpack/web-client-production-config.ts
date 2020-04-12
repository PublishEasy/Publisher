import { NULL_WEBPACK_CONFIG, WebpackConfig } from './constants-types-paths';
import { addWebClientCore } from './core-config-builders';
import { setupOptimizedProductionConfig } from './production-config-builders';

const config: WebpackConfig = setupOptimizedProductionConfig(
  addWebClientCore(NULL_WEBPACK_CONFIG),
);
// Webpack needs the default export
// eslint-disable-next-line import/no-default-export
export default config;
