import React from 'react';
import {
  Route as ReactRouterRoute,
  RouteComponentProps,
} from 'react-router-dom';

export type CustomStaticContext = {
  notFound?: boolean;
  temporaryRedirectUrl?: string;
};

type CustomRouteComponentProps = {
  staticContext?: CustomStaticContext;
};

type CustomRouteProps = {
  path?: string;
  exact?: boolean;
  render?: (props: CustomRouteComponentProps) => React.ReactNode;
  component?: React.ComponentType<CustomRouteComponentProps>;
};

const CustomRoute: React.FunctionComponent<CustomRouteProps> = ({
  render,
  ...rest
}) => {
  // A bit of type magic was needed with the render prop here as our static context has no overlap
  // with the React Router library type for staticContext which makes Typescript complain as it's
  // suspicious behaviour.
  // Note that it could also have been fixed by adding statusCode?: number to our static context but
  // that seems undesireable as we do not want to use that.
  return (
    <ReactRouterRoute
      render={render as (props: RouteComponentProps) => React.ReactNode}
      {...rest}
    />
  );
};

export { CustomRoute as Route };

export { Switch, Link, Redirect } from 'react-router-dom';
