import {
  ExpressNextFunction,
  ExpressRequest,
  ExpressRequestHandler,
  ExpressResponse,
  ExpressRouter
} from './dependencies';

import type { Middleware, Request, RouteHandler, RouterSpec } from './types';

export class RouterSpecBuilder {
  private expressRouter: ExpressRouter;

  constructor() {
    this.expressRouter = ExpressRouter();
  }

  addMiddleware(middleware: Middleware[]): RouterSpecBuilder {
    const expressMiddleware = middleware.map(this.convertToExpressMiddleware);
    this.expressRouter.use(expressMiddleware);
    return this;
  }

  addGETRoute(routePattern: string, routeHandler: RouteHandler): RouterSpecBuilder {
    this.expressRouter.get(routePattern, this.convertToExpressGetRoute(routeHandler));
    return this;
  }

  build(): RouterSpec {
    return {
      middleware: [],
      routesByMethod: {get: []}
    }
  }


  private convertToExpressMiddleware(middleware: Middleware): ExpressRequestHandler {
    return (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction): void => {
      middleware(this.expressRequestToRequest(req), res, next);
  }

  }

  private convertToExpressGetRoute(route: RouteHandler): ExpressRequestHandler {
    return (req: ExpressRequest, res: ExpressResponse): void => {
      route(this.expressRequestToRequest(req), res)
    }
  }

  private expressRequestToRequest(req: ExpressRequest): Request {
    return {
      requestUrl: req.url
    };
  }

}
