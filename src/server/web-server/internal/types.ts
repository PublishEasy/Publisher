export interface Router {
  use: (middleware: Middleware[]) => void;
}

export type Middleware = (req: Request, res: Response) => void;

export interface Request {
  dummy: string;
}

export interface Response {
  send: (message: string) => void;
}
