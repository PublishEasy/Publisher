import path from 'path';

import { ROOT_DIRECTORY } from 'src/server/paths';
import {
  ConcreteRouter,
  Middleware,
  Request,
  Response,
  Router,
} from 'src/server/web-server';

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
    router.addGETRoute('/', sendAppHtml);
    router.addGETRoute('/login', sendAppHtml);

    function sendAppHtml(_: Request, res: Response): void {
      res.sendFile(path.join(ROOT_DIRECTORY, 'public/index.html'));
    }
  }
}
