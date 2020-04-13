import React from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter } from 'react-router-dom';

import { App } from 'src/common/components/App';

const HotReloadedApp = hot(App);
ReactDOM.hydrate(
  <BrowserRouter>
    <HotReloadedApp />
  </BrowserRouter>,
  document.getElementById('root'),
);
