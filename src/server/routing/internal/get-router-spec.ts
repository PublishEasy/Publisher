import { ConcreteRouter, Middleware, Router } from './dependencies';
import { RoutingStrategy } from './types';

export function getRouterSpec(
  middleware: Middleware[],
  routingStrategy: RoutingStrategy,
): Router {
  const router = new ConcreteRouter();
  router.addMiddleware(...middleware);
  routingStrategy.applyRoutes(router);
  return router;
}
