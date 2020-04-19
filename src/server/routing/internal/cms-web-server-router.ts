import {
  ConcreteRouter,
  File,
  Path,
  renderApp,
  RenderResult,
  Request,
  Response,
} from './dependencies';
import { getRouterSpec } from './get-router-spec';
import { RouterGetter, RoutingStrategy } from './types';

export const getCMSWebServerRouter: RouterGetter = (...middleware) => {
  return getRouterSpec(middleware, new CMSWebServerRoutingStrategy());
};

class CMSWebServerRoutingStrategy implements RoutingStrategy {
  applyRoutes(router: ConcreteRouter): void {
    router.addGETWildcard(serversideRenderApp);
    async function serversideRenderApp(
      req: Request,
      res: Response,
    ): Promise<void> {
      const indexPath = Path.projectPaths.rootDirectory
        .getChild('public')
        .getChild('index.html');
      const htmlTemplate = await new File(indexPath).getContents();
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
