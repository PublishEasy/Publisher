import path from 'path';

import { ROOT_DIRECTORY } from 'src/server/paths';
import { getCMSWebServerRouter } from 'src/server/routing';
import { ProductionWebServer } from 'src/server/web-server';

const port = (process.env.PORT && parseInt(process.env.PORT)) || 8080;

const server = new ProductionWebServer()
  .serveStaticFilesFrom(path.join(ROOT_DIRECTORY, 'public'))
  .addRouter('', getCMSWebServerRouter());

server.exposeToInternetOnPort(port, () =>
  console.log(`Server running on http://localhost:${port}`),
);
