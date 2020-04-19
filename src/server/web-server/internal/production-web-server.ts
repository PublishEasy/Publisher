import {
  ExpressApplication,
  ExpressNextFunction,
  ExpressRequest,
  ExpressRequestHandler,
  ExpressResponse,
  getExpressApplication,
  getExpressRouter,
  getExpressStaticMiddleware,
  NodeHTTPServer,
  Path,
} from './dependencies';

import type {
  Router,
  WebServer,
  RouterSpec,
  Middleware,
  RouteHandler,
  Request,
} from './types';

export class ProductionWebServer implements WebServer {
  private expressApp: ExpressApplication;
  private routerSpecs: { spec: RouterSpec; pathPrefix: string }[] = [];

  constructor() {
    this.expressApp = getExpressApplication();
  }

  addRouter(pathPrefix: string, router: Router): this {
    router.addToServer(this, pathPrefix);
    return this;
  }

  serveStaticFilesFrom(pathToStaticDirectory: Path): this {
    this.expressApp.use(
      getExpressStaticMiddleware(pathToStaticDirectory.asAbsolutePathString()),
    );
    return this;
  }

  exposeToInternetOnPort(
    port: number,
    successfullyExposed?: () => void,
  ): NodeHTTPServer {
    return this.toNodeHttpServer().listen(port, successfullyExposed);
  }

  toNodeHttpServer(): NodeHTTPServer {
    this.setupAllRoutes();
    return new NodeHTTPServer(this.expressApp);
  }

  __addRouterSpec(pathPrefix: string, spec: RouterSpec): void {
    this.routerSpecs.push({ spec, pathPrefix });
  }

  private setupAllRoutes(): void {
    this.validateRouters();
    this.sortRoutersByPrefixSpecificity();
    this.routerSpecs.forEach(
      ({ spec, pathPrefix }) => this.applyRouterSpec(spec, pathPrefix),
      this,
    );
  }

  private sortRoutersByPrefixSpecificity(): void {
    this.routerSpecs
      .sort((a, b) => {
        if (a.pathPrefix < b.pathPrefix) return -1;
        else if (a.pathPrefix === b.pathPrefix) return 0;
        return 1;
      })
      .reverse();
  }

  private validateRouters(): void {
    const allPrefixes = this.routerSpecs.map((spec) => spec.pathPrefix);
    const uniquePrefixes = new Set(allPrefixes);
    if (allPrefixes.length !== uniquePrefixes.size)
      throw new Error(
        `Multiple routers with the same prefix is not allowed. Prefixes passed to server were ${JSON.stringify(
          allPrefixes,
        )}`,
      );
  }

  private applyRouterSpec(spec: RouterSpec, pathPrefix: string): void {
    const router = getExpressRouter();
    const middlewares = spec.middleware.map(this.convertToExpressMiddleware);
    middlewares.length && router.use(pathPrefix, ...middlewares);
    spec.routesByMethod.get.forEach(({ pathPattern, routeHandler }) =>
      router.get(pathPattern, this.convertToExpressGetRoute(routeHandler)),
    );
    spec.routesByMethod.getWildcard &&
      router.get(
        '*',
        this.convertToExpressGetRoute(spec.routesByMethod.getWildcard),
      );
    this.expressApp.use(pathPrefix, router);
  }

  private convertToExpressMiddleware = (
    middleware: Middleware,
  ): ExpressRequestHandler => {
    return (
      req: ExpressRequest,
      res: ExpressResponse,
      next: ExpressNextFunction,
    ): void => {
      middleware(this.expressRequestToRequest(req), res, next);
    };
  };

  private convertToExpressGetRoute = (
    route: RouteHandler,
  ): ExpressRequestHandler => {
    return (req: ExpressRequest, res: ExpressResponse): void => {
      route(this.expressRequestToRequest(req), res);
    };
  };

  private expressRequestToRequest = (req: ExpressRequest): Request => {
    return {
      requestUrl: req.url,
    };
  };
}
