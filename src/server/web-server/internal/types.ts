import type { NodeHTTPServer } from './dependencies';

type Route = { pathPattern: string; routeHandler: RouteHandler };

export interface WebServer {
  addRouter(pathPrefix: string, router: Router): WebServer;
  exposeToInternetOnPort(port: number): NodeHTTPServer;
}

export interface Router {
  addMiddleware(...middleware: Middleware[]): Router;
  addGETRoute(routePattern: string, routeHandler: RouteHandler): Router;
  /**
   * @restricted
   * This is only intended for use by the WebServer receiving it and for testing
   */
  __toRouterSpec(): RouterSpec;
}

export type RouterSpec = {
  middleware: Middleware[];
  routesByMethod: {
    get: Route[];
  };
};

export type Middleware = (
  req: Request,
  res: Response,
  callNextMiddleware: () => void,
) => never;

export type RouteHandler = (req: Request, res: Response) => void;

export interface Request {
  requestUrl: string;
}

export interface Response {
  send: (message: string) => void;
}
