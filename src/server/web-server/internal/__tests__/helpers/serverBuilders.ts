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
  router.addGETRoute('*', routeHandler);
  server.addRouter('', router);
  return server;
}
export function getServerWithGETRoutesAt(
  ...pathPatterns: string[]
): ProductionWebServer {
  const server = new ProductionWebServer();
  const router = new ConcreteRouter();
  pathPatterns.forEach((pattern) =>
    router.addGETRoute(pattern, (_req, res) => {
      res.sendStatus(200);
    }),
  );
  server.addRouter('', router);
  return server;
}
