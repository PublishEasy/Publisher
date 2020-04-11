import type {
  Middleware,
  RouteHandler,
  RouterSpec,
  Router,
  WebServer,
} from './types';

export class ConcreteRouter implements Router {
  routerSpec: RouterSpec = {
    middleware: [],
    routesByMethod: { get: [] },
  };

  addMiddleware(...middleware: Middleware[]): ConcreteRouter {
    this.routerSpec.middleware.push(...middleware);
    return this;
  }

  addGETRoute(pathPattern: string, routeHandler: RouteHandler): ConcreteRouter {
    this.routerSpec.routesByMethod.get.push({ pathPattern, routeHandler });
    return this;
  }

  addToServer(server: WebServer, pathPrefix: string): void {
    server.__addRouterSpec(pathPrefix, this.routerSpec);
  }
}
