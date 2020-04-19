import React from 'react';

import { App } from './components/App';

export type ProviderAdder = (
  appRoot: React.ComponentType,
) => React.ReactElement;

export function getReactAppWithProviders(
  addProviders: ProviderAdder,
): React.ReactElement {
  return addProviders(App);
}
