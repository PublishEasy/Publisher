import { ConcreteRouter, Middleware, Router } from 'src/server/web-server';

type RouterGetter = (...middleware: Middleware[]) => Router;

export const getAuthenticationServerRouter: RouterGetter = (...middleware) => {
  return getRouterSpec(middleware, new AuthenticationRoutingStrategy());
};

export const getCMSWebServerRouter: RouterGetter = (...middleware) => {
  return getRouterSpec(middleware, new CMSWebServerRoutingStrategy());
};

function getRouterSpec(
  middleware: Middleware[],
  routingStrategy: RoutingStrategy,
): Router {
  const router = new ConcreteRouter();
  router.addMiddleware(...middleware);
  routingStrategy.applyRoutes(router);
  return router;
}

interface RoutingStrategy {
  applyRoutes(router: ConcreteRouter): void;
}

class AuthenticationRoutingStrategy implements RoutingStrategy {
  applyRoutes(router: ConcreteRouter): void {
    router.addGETRoute('/', (_req, res) => res.send('Authentication'));
  }
}

class CMSWebServerRoutingStrategy implements RoutingStrategy {
  applyRoutes(router: ConcreteRouter): void {
    router.addGETRoute('/', (_req, res) => res.send('CMS'));
  }
}
