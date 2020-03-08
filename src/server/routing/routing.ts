import {
  Middleware,
  RouterSpec,
  RouterSpecBuilder
} from 'src/server/web-server';

type RouterSpecGetter = (middleware: Middleware[]) => RouterSpec;

export const getAuthenticationServerRouter: RouterSpecGetter = middleware => {
  return getRouterSpec(middleware, new AuthenticationRoutingStrategy());
};

export const getCMSWebServerRouter: RouterSpecGetter = middleware => {
  return getRouterSpec(middleware, new CMSWebServerRoutingStrategy());
};

function getRouterSpec(
  middleware: Middleware[],
  routingStrategy: RoutingStrategy,
): RouterSpec {
  const builder = new RouterSpecBuilder();
  builder.addMiddleware(middleware);
  routingStrategy.applyRoutes(builder);
  return builder.build();
}

interface RoutingStrategy {
  applyRoutes(router: RouterSpecBuilder): void;
}

class AuthenticationRoutingStrategy implements RoutingStrategy {
  applyRoutes(router: RouterSpecBuilder): void {
    router.addGETRoute('/', (_req, res) => res.send('Authentication'));
  }
}

class CMSWebServerRoutingStrategy implements RoutingStrategy {
  applyRoutes(router: RouterSpecBuilder): void {
    router.addGETRoute('/', (_req, res) => res.send('CMS'));
  }
}
