import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

import {
  absoluteFromRoot,
  HTML_TEMPLATE_PATH,
  PUBLIC_FILES_DIRECTORY,
  WebpackConfig
} from './constants-types-paths';

export function setupCoreFunctionality(config: WebpackConfig): WebpackConfig {
  return setupFileResolving(
    addHtmlFileBuilding(setupTranspilationAndPolyfills(config)),
  );
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
function setupTranspilationAndPolyfills(config: WebpackConfig): WebpackConfig {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...(config.module?.rules || []),
        {
          test: /\.tsx?$/,
          include: absoluteFromRoot('src'),
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript',
              '@babel/preset-react',
            ],
          },
        },
      ],
    },
  };
}

function setupFileResolving(config: WebpackConfig): WebpackConfig {
  return {
    ...config,
    entry: absoluteFromRoot('src/client/index.tsx'),
    output: {
      ...config.output,
      filename: 'main.js',
      path: PUBLIC_FILES_DIRECTORY,
    },
    resolve: {
      ...config.resolve,
      extensions: ['.ts', '.tsx', '.js'],
      modules: ['node_modules', absoluteFromRoot('.')],
    },
  };
}
