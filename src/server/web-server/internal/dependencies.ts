import express from 'express';

export type {
  RequestHandler as ExpressRequestHandler,
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction as ExpressNextFunction,
  Express as ExpressApplication, // TODO: This should possibly be imported from 'express' again in the future but for now those types seem to be broken for us, maybe due to us using the alpha release
} from 'express-serve-static-core';
export { express as getExpressApplication };
export {
  Router as getExpressRouter,
  static as getExpressStaticMiddleware,
} from 'express';
export { Server as NodeHTTPServer } from 'http';
export { Path } from 'src/server/filesystem';
