import { Middleware, ProductionRouter, Router } from 'src/server/web-server';

export type RouterGetter = (middleware: Middleware[]) => Router;

export const getAuthenticationServerRouter: RouterGetter = middleware => {
  return getRouter(middleware, new AuthenticationRoutingStrategy());
};

export const getCMSWebServerRouter: RouterGetter = middleware => {
  return getRouter(middleware, new CMSWebServerRoutingStrategy());
};

function getRouter(
  middleware: Middleware[],
  routingStrategy: RoutingStrategy,
): Router {
  const router = new ProductionRouter();
  router.addMiddleware(middleware);
  routingStrategy.applyRoutes(router);
  return router;
}

interface RoutingStrategy {
  applyRoutes(router: Router): void;
}

class AuthenticationRoutingStrategy implements RoutingStrategy {
  applyRoutes(router: Router): void {
    router.addGETRoute('/', (req, res) => res.send('Authentication'));
  }
}

class CMSWebServerRoutingStrategy implements RoutingStrategy {
  applyRoutes(router: Router): void {
    router.addGETRoute('/', (req, res) => res.send('CMS'));
  }
}
