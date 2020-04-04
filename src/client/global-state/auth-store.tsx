import React, { Dispatch, useCallback, useContext, useReducer } from 'react';

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

const AuthContext = React.createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | null>(null);

export const AuthProvider: React.FunctionComponent = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export interface AuthStore {
  isLoggedIn(): boolean;
}

class AuthStoreImplementation implements AuthStore {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }
  isLoggedIn(): boolean {
    return this.state.isLoggedIn;
  }
}

type LoginInfo = { email: string; password: string };

export const useAuth = (): {
  store: AuthStore;
  login: (loginInfo: LoginInfo) => void;
} => {
  const authContext = useContext(AuthContext);
  if (authContext === null)
    throw new Error(
      'Unexpected null AuthContext, did you forget to set a provider?',
    );
  const { state, dispatch } = authContext;

  const isCorrectLogin = ({ email, password }: LoginInfo) =>
    email === 'user@gmail.com' && password === 'password';

  return {
    store: new AuthStoreImplementation(state),
    login: useCallback(
      (loginInfo: LoginInfo) =>
        isCorrectLogin(loginInfo) && dispatch({ type: 'login' }),
      [dispatch],
    ),
  };
};
