import type { NodeHTTPServer } from './dependencies';
export { NodeHTTPServer };

type Route = { pathPattern: string; routeHandler: RouteHandler };

export interface WebServer {
  addRouter(pathPrefix: string, router: Router): WebServer;
  serveStaticFilesFrom(pathToStaticDirectory: string): WebServer;
  __addRouterSpec(pathPrefix: string, spec: RouterSpec): void;
  exposeToInternetOnPort(
    port: number,
    successfullyExposed?: () => void,
  ): NodeHTTPServer;
}

export interface Router {
  addMiddleware(...middleware: Middleware[]): Router;
  addGETRoute(routePattern: string, routeHandler: RouteHandler): Router;
  addToServer(server: WebServer, pathPrefix: string): void;
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
) => void;

export type RouteHandler = (req: Request, res: Response) => void;

export interface Request {
  requestUrl: string;
}

export interface Response {
  send: (message: string) => void;
  sendFile: (filePath: string) => void;
  sendStatus: (status: number) => void;
}
