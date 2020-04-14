import { NamedChunksPlugin, NamedModulesPlugin, RuleSetRule } from 'webpack';

import {
  DEV_SERVER_PORT,
  PUBLIC_FILES_DIRECTORY,
  URL_TO_SERVE_PUBLIC_FILES_FROM,
  WebpackConfig,
} from './constants-types-paths';
import { getProcessEnvPlugin } from './get-process-env-plugin';

export function setupUnoptimizedConvenientDevConfig(
  config: WebpackConfig,
): WebpackConfig {
  const withReadabilityAndNodeEnv = setDevNodeEnvAndReadableWebpackNames(
    config,
  );
  const alsoWithSourceMaps = setDevSourceMaps(withReadabilityAndNodeEnv);
  const alsoWithDevServer = addWebpackDevServer(alsoWithSourceMaps);
  const alsoWithHotReloading = addHotReloading(alsoWithDevServer);
  return alsoWithHotReloading;
}

function setDevNodeEnvAndReadableWebpackNames(
  config: WebpackConfig,
): WebpackConfig {
  return {
    ...config,
    // These three should be equivalent to mode: 'development' but we just set it manually
    // to have better reproducibility
    plugins: [
      ...(config.plugins || []),
      getProcessEnvPlugin([{ key: 'NODE_ENV', value: 'development' }]),
      new NamedChunksPlugin(),
      new NamedModulesPlugin(),
    ],
  };
}

function setDevSourceMaps(config: WebpackConfig): WebpackConfig {
  return {
    ...config,
    // This should give the highest quality source maps but still be fast on rebuild
    // according to https://webpack.js.org/configuration/devtool/
    devtool: 'eval-source-map',
  };
}

function addWebpackDevServer(config: WebpackConfig): WebpackConfig {
  return {
    ...config,
    devServer: {
      ...config.devServer,
      contentBase: PUBLIC_FILES_DIRECTORY,
      publicPath: URL_TO_SERVE_PUBLIC_FILES_FROM,
      port: DEV_SERVER_PORT,
      // Just minimizing logging
      clientLogLevel: 'silent',
      stats: 'minimal',
      // This makes the dev server serve our index.html on all requests
      // which is in line with our single page app that loads itself
      // when it reaches the client
      historyApiFallback: true,
    },
  };
}

function addHotReloading(config: WebpackConfig): WebpackConfig {
  return {
    ...config,
    devServer: {
      ...config.devServer,
      hot: true,
    },
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        // Apparently needed for hooks support https://github.com/gaearon/react-hot-loader#getting-started
        'react-dom': '@hot-loader/react-dom',
      },
    },
    module: {
      ...config.module,
      rules: getLoadersWithAddedHotReload(config.module?.rules),
    },
  };
}

function getLoadersWithAddedHotReload(rules?: RuleSetRule[]): RuleSetRule[] {
  const babelLoaderNotFoundError = new Error(
    `Babel Loader must already be set when adding webpack dev server. Rules provided were: ${JSON.stringify(
      rules,
    )}`,
  );

  if (!rules) throw babelLoaderNotFoundError;

  let babelLoaderFound = false;

  const rulesWithHotReloading = rules.map((unmodifiedRule) =>
    addHotReloadingIfIsBabelLoader(unmodifiedRule, markBabelLoaderFound),
  );

  if (!babelLoaderFound) throw babelLoaderNotFoundError;

  return rulesWithHotReloading;

  function markBabelLoaderFound(): void {
    if (babelLoaderFound) {
      throw new Error(
        `Two babel loaders found, when one expected: Rules provided were ${JSON.stringify(
          rules,
        )}`,
      );
    }
    babelLoaderFound = true;
  }
}

function addHotReloadingIfIsBabelLoader(
  unmodifiedRule: RuleSetRule,
  markBabelLoaderFound: () => void,
): RuleSetRule {
  if (isBabelLoader(unmodifiedRule)) {
    markBabelLoaderFound();
    return constructBabelLoaderWithHotReloading(unmodifiedRule);
  }
  return unmodifiedRule;
}

function isBabelLoader(rule: RuleSetRule): boolean {
  const loaderName = 'babel-loader';
  const loaderIsInToplevel = rule.loader === loaderName;
  const loaderIsInUseKey =
    rule.use instanceof Array &&
    rule.use.some((x) => typeof x === 'object' && x.loader === loaderName);
  // This is a pretty partial check but for now if this is giving false negatives
  // then just update it to support an extra use case
  return loaderIsInToplevel || loaderIsInUseKey;
}

function constructBabelLoaderWithHotReloading(rule: RuleSetRule): RuleSetRule {
  if (typeof rule.options === 'object') {
    const originalPlugins = (rule.options?.plugins || []) as string[];
    const ruleWithHotReloading = {
      ...rule,
      options: {
        ...rule.options,
        plugins: [...originalPlugins, 'react-hot-loader/babel'],
      },
    };
    return ruleWithHotReloading;
  } else {
    throw new Error(
      `The rule didn't have a top level options as expected. The rule is ${JSON.stringify(
        rule,
      )}`,
    );
  }
}
