import { DefinePlugin } from 'webpack';

export function getProcessEnvPlugin(
  keyValuePairs: {
    key: string;
    value: string;
  }[],
): DefinePlugin {
  const initialValue = {};
  const definePluginKeyValues = keyValuePairs.reduce((accumulator, pair) => {
    return {
      ...accumulator,
      /**
         * We specify the full key here so it doesn't overwrite all of process.env.
         * It also makes it composable with other DefinePlugins used in other functions

         * We use JSON.stringify here as it is the recommended way because
         * the value has to be "'string'" so that the value that is replaced in
         * source is a true javascript string (otherwise it would just insert a variable
         * named string)
         */
      [`process.env.${pair.key}`]: JSON.stringify(pair.value),
    };
  }, initialValue);
  return new DefinePlugin(definePluginKeyValues);
}
