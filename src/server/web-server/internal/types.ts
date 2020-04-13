import type { NodeHTTPServer } from './dependencies';
export { NodeHTTPServer };

export type Route = { pathPattern: string; routeHandler: RouteHandler };

export interface WebServer {
  addRouter(pathPrefix: string, router: Router): this;
  serveStaticFilesFrom(pathToStaticDirectory: string): this;
  __addRouterSpec(pathPrefix: string, spec: RouterSpec): void;
  exposeToInternetOnPort(
    port: number,
    successfullyExposed?: () => void,
  ): NodeHTTPServer;
}

export interface Router {
  addMiddleware(...middleware: Middleware[]): this;
  addGETRoute(routePattern: string, routeHandler: RouteHandler): this;
  addGETWildcard(routeHandler: RouteHandler): this;
  addToServer(server: WebServer, pathPrefix: string): void;
}

export type RouterSpec = {
  middleware: Middleware[];
  routesByMethod: {
    getWildcard?: RouteHandler;
    get: Route[];
  };
};

export type Middleware = (
  req: Request,
  res: Response,
  callNextMiddleware: () => void,
) => void;

export type RouteHandler = (req: Request, res: Response) => void;

export interface Request {
  requestUrl: string;
}

export interface Response {
  send: (message: string) => void;
  status: (statusCode: number) => this;
  sendStatus: (status: number) => void;
  sendFile: (filePath: string) => void;
  redirect: (statusCode: number, url: string) => void;
}
