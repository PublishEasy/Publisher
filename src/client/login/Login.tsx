import React from 'react';
import { Redirect } from 'react-router-dom';

import { EmailInput, Form, PasswordInput } from 'src/client/building-blocks';
import { AuthProvider, useAuth } from 'src/client/global-state/auth-store';
import { ROUTES } from 'src/common/routes';

export const Login: React.FunctionComponent = () => {
  return (
    <AuthProvider>
      <LoginA />
    </AuthProvider>
  );
};
const LoginA: React.FunctionComponent = () => {
  const { store, login } = useAuth();
  if (store.isLoggedIn()) return <Redirect to={ROUTES.homepage} />;
  return <LoginComponent login={login} />;
};

const LoginComponent: React.FunctionComponent<{ login: () => void }> = ({
  login,
}) => {
  return (
    <Form onSubmit={login}>
      <EmailInput />
      <PasswordInput />
      <button type="submit">Login</button>
    </Form>
  );
};
