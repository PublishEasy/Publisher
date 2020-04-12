// Webpack-dev-server modifies the Configuration import above
// and importing this here applies that modification dynamically
// So if we were to upgrade the package and they changed the config
// it should fail the type!
// eslint-disable-next-line import/no-unassigned-import
import 'webpack-dev-server';

import path from 'path';

import type { Configuration } from 'webpack';

// Can't export normally due to --isolatedModules https://github.com/Microsoft/TypeScript/issues/21194
export type WebpackConfig = Configuration;
export const PUBLIC_FILES_DIRECTORY = absoluteFromRoot('public');
export const DIST_DIRECTORY = absoluteFromRoot('dist');
export const URL_TO_SERVE_PUBLIC_FILES_FROM = '/';
export const DEV_SERVER_PORT = 3000;
export const HTML_TEMPLATE_PATH = absoluteFromRoot('src/client/index.html');
export const NULL_WEBPACK_CONFIG: WebpackConfig = {
  // This ensures no default config is set by webpack so we can build it just the way we want
  mode: 'none',
};

export function absoluteFromRoot(relativePath: string): string {
  return path.resolve(__dirname, '..', '..', relativePath);
}
