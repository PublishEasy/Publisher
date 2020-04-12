import { getProcessEnvPlugin } from './get-process-env-plugin';

import type { WebpackConfig } from './constants-types-paths';

export function setupOptimizedProductionConfig(
  config: WebpackConfig,
): WebpackConfig {
  return setOptimizationsAndProdNodeEnv(config);
}

function setOptimizationsAndProdNodeEnv(config: WebpackConfig): WebpackConfig {
  return {
    ...config,
    // These three should be equivalent to mode: 'development' but we just set it manually
    // to have better reproducibility
    plugins: [
      ...(config.plugins || []),
      getProcessEnvPlugin([{ key: 'NODE_ENV', value: 'production' }]),
    ],
    mode: 'production',
  };
}
