import React from 'react';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';

import { Login } from 'src/client/login/Login';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <Link to="/login">Login</Link>
          <Switch>
            <Route path="/login" exact component={Login} />
            <Route render={(): React.ReactNode => <div>Logged in</div>} />
          </Switch>
        </header>
      </div>
    </BrowserRouter>
  );
};
