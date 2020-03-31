import React from 'react';

export const Form: React.FunctionComponent<{ onSubmit: () => void }> = ({
  onSubmit,
  children,
}) => (
  <form
    onSubmit={(e): void => {
      e.preventDefault();
      onSubmit();
    }}
  >
    {children}
  </form>
);
