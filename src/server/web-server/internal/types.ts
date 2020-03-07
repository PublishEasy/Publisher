export interface Router {
  addMiddleware: (middleware: Middleware[]) => void;
  addGETRoute: (routePattern: string, routeHandler: RouteHandler) => void;
}

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
