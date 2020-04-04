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

  return {
    store: new AuthStoreImplementation(state),
    login: useCallback(
      async (loginInfo: LoginInfo) => {
        const success = await apiClient.login(loginInfo);
        if (success) {
          dispatch({ type: 'login' });
        }
      },
      [dispatch],
    ),
  };
};

class ApiClientStub {
  login({ email, password }: LoginInfo): Promise<boolean> {
    return Promise.resolve(
      email === 'user@gmail.com' && password === 'password',
    );
  }
}

const apiClient = new ApiClientStub();
