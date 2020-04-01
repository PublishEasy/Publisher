import React, { ChangeEventHandler, useReducer } from 'react';

export const EmailInput: React.FunctionComponent = () => {
  return <Input label="Email" type="email" />;
};

export const PasswordInput: React.FunctionComponent = () => {
  return <Input label="Password" type="password" />;
};

type State = {
  value: string;
};
const initialState: State = { value: '' };
type Action = { type: 'update'; payload: { newValue: string } };
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'update':
      return { value: action.payload.newValue };
    default:
      throw new Error();
  }
}
const Input: React.FunctionComponent<{
  label: string;
  type: React.InputHTMLAttributes<HTMLInputElement>['type'];
}> = ({ label, type }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <InputComponent
      label={label}
      type={type}
      value={state.value}
      onChange={(e): void =>
        dispatch({
          type: 'update',
          payload: { newValue: e.target.value },
        })
      }
    />
  );
};

const InputComponent: React.FunctionComponent<{
  label: string;
  type: React.InputHTMLAttributes<HTMLInputElement>['type'];
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}> = ({ label, type, value, onChange }) => {
  const id = `${label}-input`;
  return (
    <div>
      <label htmlFor={id}>
        <div>{label}</div>
        <input id={id} type={type} value={value} onChange={onChange} />
      </label>
    </div>
  );
};