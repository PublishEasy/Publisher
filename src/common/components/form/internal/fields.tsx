import React, { ChangeEventHandler } from 'react';

import { useForm } from './form-state-store';

export const EmailField: React.FunctionComponent<{ name: string }> = ({
  name,
}) => {
  return <Input label="Email" type="email" name={name} />;
};

export const PasswordField: React.FunctionComponent<{ name: string }> = ({
  name,
}) => {
  return <Input label="Password" type="password" name={name} />;
};

const Input: React.FunctionComponent<{
  label: string;
  type: React.InputHTMLAttributes<HTMLInputElement>['type'];
  name: string;
}> = ({ label, type, name }) => {
  const { values, handleChange } = useForm();
  return (
    <InputComponent
      label={label}
      type={type}
      value={values.get(name)}
      name={name}
      onChange={handleChange}
    />
  );
};

const InputComponent: React.FunctionComponent<{
  label: string;
  type: React.InputHTMLAttributes<HTMLInputElement>['type'];
  value: string;
  name: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}> = ({ label, type, value, onChange, name }) => {
  const id = `${label}-input`;
  return (
    <div>
      <label htmlFor={id}>
        <div>{label}</div>
        <input
          id={id}
          type={type}
          value={value}
          name={name}
          onChange={onChange}
        />
      </label>
    </div>
  );
};
