import React, { useCallback, useReducer } from 'react';
import { Redirect } from 'react-router-dom';

import { Form } from 'src/client/building-blocks/Form';
import {
  EmailInput,
  PasswordInput
} from 'src/client/building-blocks/input-components';
import { ROUTES } from 'src/common/routes';

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

type State = {
  isLoggedIn: boolean;
};
const initialState: State = { isLoggedIn: false };
type Action = { type: 'login' };
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'login':
      return { isLoggedIn: true };
    default:
      throw new Error();
  }
}

export const Login: React.FunctionComponent = () => {
  const [{ isLoggedIn }, dispatch] = useReducer(reducer, initialState);
  const login = useCallback(() => dispatch({ type: 'login' }), [dispatch]);
  if (isLoggedIn) return <Redirect to={ROUTES.homepage} />;
  return <LoginComponent login={login} />;
};
