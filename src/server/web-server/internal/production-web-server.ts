import {
  ExpressApplication,
  ExpressNextFunction,
  ExpressRequest,
  ExpressRequestHandler,
  ExpressResponse,
  getExpressApplication,
  getExpressRouter,
  NodeHTTPServer,
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

  constructor() {
    this.expressApp = getExpressApplication();
  }

  addRouter(pathPrefix: string, router: Router): ProductionWebServer {
    router.addToServer(this, pathPrefix);
    return this;
  }

  exposeToInternetOnPort(
    port: number,
    successfullyExposed?: () => void,
  ): NodeHTTPServer {
    return this.expressApp.listen(port, successfullyExposed);
  }

  toNodeHttpServer(): NodeHTTPServer {
    return new NodeHTTPServer(this.expressApp);
  }

  __addRouterSpec(pathPrefix: string, spec: RouterSpec): void {
    const router = getExpressRouter();
    const middlewares = spec.middleware.map(this.convertToExpressMiddleware);
    middlewares.length && router.use(middlewares);
    spec.routesByMethod.get.forEach(({ pathPattern, routeHandler }) =>
      router.get(pathPattern, this.convertToExpressGetRoute(routeHandler)),
    );
    this.expressApp.use(router);
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
