import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import nodeExternals from 'webpack-node-externals';

import {
  absoluteFromRoot,
  DIST_DIRECTORY,
  HTML_TEMPLATE_PATH,
  PUBLIC_FILES_DIRECTORY,
  WebpackConfig,
} from './constants-types-paths';

export function addWebClientCore(config: WebpackConfig): WebpackConfig {
  return setupWebClientFileResolving(
    addHtmlFileBuilding(setupWebClientTranspilationAndPolyfills(config)),
  );

  function setupWebClientFileResolving(config: WebpackConfig): WebpackConfig {
    return {
      ...config,
      entry: absoluteFromRoot('src/client/index.tsx'),
      output: {
        ...config.output,
        filename: 'main.js',
        path: PUBLIC_FILES_DIRECTORY,
      },
      resolve: getResolveSettings(config),
    };
  }

  function addHtmlFileBuilding(config: WebpackConfig): WebpackConfig {
    return {
      ...config,
      plugins: [
        ...(config.plugins || []),
        new HtmlWebpackPlugin({
          template: HTML_TEMPLATE_PATH,
          filename: path.resolve(PUBLIC_FILES_DIRECTORY, 'index.html'),
          // This creates a random hash, which ensures the client browser
          // won't cache
          hash: true,
        }),
      ],
    };
  }

  function setupWebClientTranspilationAndPolyfills(
    config: WebpackConfig,
  ): WebpackConfig {
    return addWebpackLoader(
      config,
      getBabelLoaderWithOptions({
        useBuiltIns: 'usage',
        corejs: { version: 3, proposals: true },
        bugfixes: true,
      }),
    );
  }
}

export function addServerCore(config: WebpackConfig): WebpackConfig {
  return excludeNodeModulesFromBundle(
    setupServerTranspilation(setupServerFileResolving(config)),
  );

  function setupServerFileResolving(config: WebpackConfig): WebpackConfig {
    return {
      ...config,
      target: 'node',
      node: {
        // Don't mock / polyfill any of the node globals
        global: false,
        __dirname: false,
        __filename: false,
      },
      entry: absoluteFromRoot('src/server/index.ts'),
      output: {
        ...config.output,
        filename: 'server.js',
        path: DIST_DIRECTORY,
      },
      resolve: getResolveSettings(config),
    };
  }
  function setupServerTranspilation(config: WebpackConfig): WebpackConfig {
    return addWebpackLoader(
      config,
      getBabelLoaderWithOptions({
        ignoreBrowserslistConfig: true,
        targets: {
          node: 'current',
        },
        bugfixes: true,
      }),
    );
  }
  function excludeNodeModulesFromBundle(config: WebpackConfig): WebpackConfig {
    return {
      ...config,
      externals: [nodeExternals()],
    };
  }
}

function getResolveSettings(config: WebpackConfig): WebpackConfig['resolve'] {
  return {
    ...config.resolve,
    extensions: ['.ts', '.tsx', '.js'],
    modules: ['node_modules', absoluteFromRoot('.')],
  };
}

function addWebpackLoader(config: WebpackConfig, newRule: {}): WebpackConfig {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [...(config.module?.rules || []), newRule],
    },
  };
}

function getBabelLoaderWithOptions(options: {}): {} {
  return {
    test: /\.tsx?$/,
    include: absoluteFromRoot('src'),
    loader: 'babel-loader',
    options: {
      presets: [
        ['@babel/preset-env', options],
        '@babel/preset-typescript',
        '@babel/preset-react',
      ],
      plugins: ['@babel/plugin-proposal-class-properties'],
    },
  };
}
