import {
  ExpressRequest,
  ExpressRequestHandler,
  ExpressResponse,
  ExpressRouter
} from './dependencies';

import type { Middleware, Router, Request, RouteHandler } from './types';

export class ProductionRouter implements Router {
  private expressRouter: ExpressRouter;

  constructor() {
    this.expressRouter = ExpressRouter();
  }

  addMiddleware(middleware: Middleware[]): void {
    const expressMiddleware = middleware.map(this.convertToExpressMiddleware);
    this.expressRouter.use(expressMiddleware);
  }

  private convertToExpressMiddleware(middleware: Middleware): ExpressRequestHandler {
    return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
      middleware(this.expressRequestToRequest(req), res, next);
  }

  }

  addGETRoute(routePattern: string, routeHandler: RouteHandler): void {
    this.expressRouter.get(routePattern, this.convertToExpressGetRoute(routeHandler));
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
