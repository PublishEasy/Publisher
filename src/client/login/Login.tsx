import React from 'react';

export const Login: React.FunctionComponent = () => {
  return (
    <form>
      <TextInput label="Email" />
      <PasswordInput />
      <button type="submit">Login</button>
    </form>
  );
};

const TextInput: React.FunctionComponent<{ label: string }> = ({ label }) => {
  return <Input label={label} type="text" />;
};

const PasswordInput: React.FunctionComponent = () => {
  return <Input label="Password" type="password" />;
};

const Input: React.FunctionComponent<{
  label: string;
  type: React.InputHTMLAttributes<HTMLInputElement>['type'];
}> = ({ label, type }) => {
  const id = `${label}-input`;
  return (
    <div>
      <label htmlFor={id}>
        <div>{label}</div>
        <input id={id} type={type} />
      </label>
    </div>
  );
};
