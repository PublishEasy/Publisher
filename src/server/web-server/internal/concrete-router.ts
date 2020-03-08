
import type { Middleware, RouteHandler, RouterSpec, Router } from './types';

export class ConcreteRouter implements Router {
  addMiddleware(...middleware: Middleware[]): ConcreteRouter {
    console.log(middleware);
    return this;
  }

  addGETRoute(routePattern: string, routeHandler: RouteHandler): ConcreteRouter {
    console.log(routePattern, routeHandler);
    return this;
  }

  __toRouterSpec(): RouterSpec {
    return {
      middleware: [],
      routesByMethod: {get: []}
    }
  }

}
