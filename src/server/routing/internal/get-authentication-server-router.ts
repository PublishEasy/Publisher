import type { ConcreteRouter } from './dependencies';

import { getRouterSpec } from './get-router-spec';
import { RouterGetter, RoutingStrategy } from './types';

export const getAuthenticationServerRouter: RouterGetter = (...middleware) => {
  return getRouterSpec(middleware, new AuthenticationRoutingStrategy());
};
class AuthenticationRoutingStrategy implements RoutingStrategy {
  applyRoutes(router: ConcreteRouter): void {
    router.addGETRoute('/', (_req, res) => res.send('Authentication'));
  }
}
