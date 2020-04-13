import type {
  Middleware,
  RouteHandler,
  RouterSpec,
  Router,
  WebServer,
} from './types';

export class ConcreteRouter implements Router {
  private routerSpec: RouterSpec = {
    middleware: [],
    routesByMethod: { get: [] },
  };

  addMiddleware(...middleware: Middleware[]): this {
    this.routerSpec.middleware.push(...middleware);
    return this;
  }

  addGETRoute(pathPattern: string, routeHandler: RouteHandler): this {
    if (pathPattern === '*')
      throw new Error(
        'wildcard routes should only be set with the addGETWildcard method',
      );
    this.routerSpec.routesByMethod.get.push({ pathPattern, routeHandler });
    return this;
  }

  addGETWildcard(routeHandler: RouteHandler): this {
    if (this.routerSpec.routesByMethod.getWildcard)
      throw new Error('Several wildcard routes in one router is not allowed');
    this.routerSpec.routesByMethod.getWildcard = routeHandler;
    return this;
  }

  addToServer(server: WebServer, pathPrefix: string): void {
    server.__addRouterSpec(pathPrefix, this.routerSpec);
  }
}
