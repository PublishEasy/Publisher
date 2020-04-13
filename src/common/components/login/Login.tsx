import React from 'react';
import { Redirect } from 'react-router-dom';

import { EmailInput, Form, PasswordInput } from 'src/common/components/form';
import {
  AuthProvider,
  useAuth,
} from 'src/common/components/global-state/auth-store';
import { ROUTES } from 'src/common/routes';

export const Login: React.FunctionComponent = () => {
  return (
    <AuthProvider>
      <LoginContainer />
    </AuthProvider>
  );
};

const LoginContainer: React.FunctionComponent = () => {
  const { store, login } = useAuth();
  if (store.isLoggedIn()) return <Redirect to={ROUTES.homepage} />;
  return <LoginComponent login={login} />;
};

type LoginFormValues = { email: string; password: '' };

const LoginComponent: React.FunctionComponent<{
  login: (loginFormValues: LoginFormValues) => void;
}> = ({ login }) => {
  return (
    <Form initialValues={{ email: '', password: '' }} onSubmit={login}>
      <EmailInput name="email" />
      <PasswordInput name="password" />
      <button type="submit">Login</button>
    </Form>
  );
};
