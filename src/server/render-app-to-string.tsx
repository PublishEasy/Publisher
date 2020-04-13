import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

import { App } from 'src/common/components/App';

import type { CustomStaticContext } from 'src/common/components/routing';
export type RenderResult = {
  html: string;
  meta: { notFound?: boolean; temporaryRedirect?: string };
};

type CustomStaticRouterContext = CustomStaticContext & { url?: string };

export function renderApp(url: string): RenderResult {
  const context: CustomStaticRouterContext = {};
  const html = ReactDOMServer.renderToString(
    <StaticRouter location={url} context={context}>
      <App />
    </StaticRouter>,
  );
  return {
    html,
    meta: {
      notFound: context.notFound,
      temporaryRedirect: context.url,
    },
  };
}
