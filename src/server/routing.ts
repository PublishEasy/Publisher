import fs from 'fs';
import path from 'path';

import { ROOT_DIRECTORY } from 'src/server/paths';
import { renderApp, RenderResult } from 'src/server/render-app-to-string';
import {
  ConcreteRouter,
  Middleware,
  Request,
  Response,
  Router,
} from 'src/server/web-server';

type RouterGetter = (...middleware: Middleware[]) => Router;

export const getAuthenticationServerRouter: RouterGetter = (...middleware) => {
  return getRouterSpec(middleware, new AuthenticationRoutingStrategy());
};

export const getCMSWebServerRouter: RouterGetter = (...middleware) => {
  return getRouterSpec(middleware, new CMSWebServerRoutingStrategy());
};

function getRouterSpec(
  middleware: Middleware[],
  routingStrategy: RoutingStrategy,
): Router {
  const router = new ConcreteRouter();
  router.addMiddleware(...middleware);
  routingStrategy.applyRoutes(router);
  return router;
}

interface RoutingStrategy {
  applyRoutes(router: ConcreteRouter): void;
}

class AuthenticationRoutingStrategy implements RoutingStrategy {
  applyRoutes(router: ConcreteRouter): void {
    router.addGETRoute('/', (_req, res) => res.send('Authentication'));
  }
}

class CMSWebServerRoutingStrategy implements RoutingStrategy {
  applyRoutes(router: ConcreteRouter): void {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    router.addGETWildcard(serversideRenderApp);

    async function serversideRenderApp(
      req: Request,
      res: Response,
    ): Promise<void> {
      const htmlTemplate = await fs.promises.readFile(
        path.join(ROOT_DIRECTORY, 'public/index.html'),
        'utf8',
      );
      const renderResult = renderApp(req.requestUrl);
      const fullHtml = htmlTemplate.replace(
        '<div id="root"></div>',
        `<div id="root">${renderResult.html}</div>`,
      );
      const { exceptionFound } = handleRenderExceptions(renderResult, res);
      if (!exceptionFound) {
        res.status(200).send(fullHtml);
      }
    }
  }
}

function handleRenderExceptions(
  { html, meta: renderMeta }: RenderResult,
  res: Response,
): { exceptionFound: boolean } {
  if (renderMeta.temporaryRedirect) {
    handleTemporaryRedirect(renderMeta.temporaryRedirect, res);
    return { exceptionFound: true };
  }
  if (renderMeta.notFound) {
    handleNotFound(html, res);
    return { exceptionFound: true };
  }
  return { exceptionFound: false };
}

function handleTemporaryRedirect(redirectUrl: string, res: Response): void {
  res.redirect(307, redirectUrl);
}

function handleNotFound(html: string, res: Response): void {
  res.status(404).send(html);
}
