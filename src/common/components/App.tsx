import React from 'react';

import { Login } from 'src/common/components/login/Login';
import { Link, Route, Switch } from 'src/common/components/routing';

export const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <Link to="/login">Login</Link>
        <Switch>
          <Route path="/login" exact component={Login} />
          <Route
            path="/"
            exact
            render={(): React.ReactNode => <div>Logged in</div>}
          />
          <NotFound />
        </Switch>
      </header>
    </div>
  );
};

const NotFound: React.FunctionComponent = () => {
  return (
    <Route
      render={({ staticContext }): React.ReactElement => {
        if (staticContext) staticContext.notFound = true;
        return <div>Sorry this page does not exist</div>;
      }}
    />
  );
};
