import { hot } from 'react-hot-loader/root';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

const HotReloadedApp = hot(App);
ReactDOM.render(<HotReloadedApp />, document.getElementById('root'));
