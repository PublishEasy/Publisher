import React from 'react';

import { FormProvider, useForm } from './form-state-store';

import type { FormValues } from './types';

type Props<Values extends FormValues> = React.PropsWithChildren<{
  initialValues: Values;
  onSubmit: (values: Values) => void;
}>;

export function Form<Values extends FormValues>({
  initialValues,
  onSubmit,
  children,
}: Props<Values>): React.ReactElement {
  return (
    <FormProvider initialValues={initialValues}>
      <FormComponent onSubmit={onSubmit}>{children}</FormComponent>
    </FormProvider>
  );
}

function FormComponent<Values extends FormValues>({
  children,
  onSubmit,
}: Pick<Props<Values>, 'children' | 'onSubmit'>): React.ReactElement {
  const { values } = useForm();
  return (
    <form
      onSubmit={(e): void => {
        e.preventDefault();
        onSubmit(values.getRawValues() as Values);
      }}
    >
      {children}
    </form>
  );
}
