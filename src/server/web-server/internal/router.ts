
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

  /**
   * This is only intended for use by the WebServer receiving it and for testing
   */
  __toRouterSpec(): RouterSpec {
    return {
      middleware: [],
      routesByMethod: {get: []}
    }
  }

}
