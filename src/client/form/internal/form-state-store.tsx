import React, { useContext, useReducer } from 'react';

import type { FormValues, FieldValue } from './types';

type State = { values: FormValues };
type Action = {
  type: 'updateValue';
  payload: { fieldName: string; newValue: FieldValue };
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'updateValue': {
      const { fieldName, newValue } = action.payload;
      return { ...state, values: { ...state.values, [fieldName]: newValue } };
    }
    default:
      throw new Error();
  }
}

const FormContext = React.createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const FormProvider: React.FunctionComponent<{
  initialValues: FormValues;
}> = ({ initialValues, children }) => {
  const [state, dispatch] = useReducer(reducer, { values: initialValues });
  return (
    <FormContext.Provider value={{ state, dispatch }}>
      {children}
    </FormContext.Provider>
  );
};

class Values {
  values: FormValues;
  constructor(values: FormValues) {
    this.values = values;
  }

  get(name: string): FieldValue {
    const x = this.values[name];
    if (x === undefined)
      throw new Error(`${name} did not exist in form values`);
    return x;
  }

  getRawValues(): FormValues {
    return this.values;
  }
}
type FormHook = {
  values: Values;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
};
export function useForm(): FormHook {
  const context = useContext(FormContext);
  if (context === null) {
    throw new Error('No Form Context was provided');
  }
  const { state, dispatch } = context;
  return {
    values: new Values(state.values),
    handleChange(e): void {
      dispatch({
        type: 'updateValue',
        payload: { fieldName: e.target.name, newValue: e.target.value },
      });
    },
  };
}
