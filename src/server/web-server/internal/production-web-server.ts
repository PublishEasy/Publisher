import { NodeHTTPServer } from './dependencies';

import type { Router, WebServer } from './types';

export class ProductionWebServer implements WebServer{
  // private expressRouter: ExpressRouter;

  // constructor() {
  //   this.expressRouter = ExpressRouter();
  // }

  addRouter(
    pathPrefix: string,
    router: Router,
  ): ProductionWebServer {
    // this.expressApplication.use(pathPrefix, router);
    console.log(pathPrefix, router);
    return this;
  }
  exposeToInternetOnPort(port: number): NodeHTTPServer {
    console.log(port);
    return new NodeHTTPServer();
  }


  // private convertToExpressMiddleware(middleware: Middleware): ExpressRequestHandler {
  //   return (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction): void => {
  //     middleware(this.expressRequestToRequest(req), res, next);
  // }

  // }

  // private convertToExpressGetRoute(route: RouteHandler): ExpressRequestHandler {
  //   return (req: ExpressRequest, res: ExpressResponse): void => {
  //     route(this.expressRequestToRequest(req), res)
  //   }
  // }

  // private expressRequestToRequest(req: ExpressRequest): Request {
  //   return {
  //     requestUrl: req.url
  //   };
  // }
}
