import React from 'react';

import { Login } from 'src/client/login/Login';

export const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          it <code>src/Ap</code> <SubText />
        </p>
        <Login />
      </header>
    </div>
  );
};

const SubText: React.FC = () => <>t</>;
