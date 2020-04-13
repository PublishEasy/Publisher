import { ConcreteRouter } from '../../concrete-router';
import { ProductionWebServer } from '../../production-web-server';

import type { Middleware, RouteHandler } from '../../types';

export function getServerWithWildcardGETandMiddleware(
  routeHandler: RouteHandler,
  ...middleware: Middleware[]
): ProductionWebServer {
  const server = new ProductionWebServer();
  const router = new ConcreteRouter();
  router.addMiddleware(...middleware);
  router.addGETWildcard(routeHandler);
  server.addRouter('', router);
  return server;
}
export function getServerWithGETRoutesAt(
  ...routes: (string | { pathPattern: string; response: string })[]
): ProductionWebServer {
  const server = new ProductionWebServer();
  const router = buildRouter(routes);
  server.addRouter('', router);
  return server;
}

export function getMultipleRouterServerWithGETRoutesAt(
  ...routers: {
    pathPrefix: string;
    routes: (string | { pathPattern: string; response: string })[];
  }[]
): ProductionWebServer {
  const server = new ProductionWebServer();
  routers.forEach((spec) =>
    server.addRouter(spec.pathPrefix, buildRouter(spec.routes)),
  );
  return server;
}

function buildRouter(
  routes: (string | { pathPattern: string; response: string })[],
): ConcreteRouter {
  const router = new ConcreteRouter();
  routes.forEach((route) => {
    const routeObject =
      typeof route === 'string' ? { pathPattern: route, response: '' } : route;
    if (routeObject.pathPattern === '*')
      router.addGETWildcard((_, res) => res.send(routeObject.response));
    else
      router.addGETRoute(routeObject.pathPattern, (_, res) =>
        res.send(routeObject.response),
      );
  });
  return router;
}
export function setWildcardRouteThroughNormalMethod(): void {
  const router = new ConcreteRouter();
  router.addGETRoute('*', () => {
    console.log('This should not be reached');
  });
}
