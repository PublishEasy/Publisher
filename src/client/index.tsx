import React from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter } from 'react-router-dom';

import {
  getReactAppWithProviders,
  ProviderAdder,
} from 'src/common/get-react-app-with-providers';

ReactDOM.hydrate(getReactApp(), document.getElementById('root'));

function getReactApp(): React.ReactElement {
  const addDevProviders: ProviderAdder = (AppRoot) => {
    const HotReloadedApp = hot(AppRoot);
    return addProdProviders(HotReloadedApp);
  };
  const addProdProviders: ProviderAdder = (AppRoot) => {
    return (
      <BrowserRouter>
        <AppRoot />
      </BrowserRouter>
    );
  };
  return process.env.NODE_ENV === 'production'
    ? getReactAppWithProviders(addProdProviders)
    : getReactAppWithProviders(addDevProviders);
}
