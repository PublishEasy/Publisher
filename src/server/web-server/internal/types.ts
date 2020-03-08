type Route = { pathPattern: string; routeHandler: RouteHandler };

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
