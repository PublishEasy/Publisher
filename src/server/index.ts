import { Path } from 'src/server/filesystem';
import { getCMSWebServerRouter } from 'src/server/routing';
import { ProductionWebServer } from 'src/server/web-server';

const port = (process.env.PORT && parseInt(process.env.PORT)) || 8080;

const server = new ProductionWebServer()
  .serveStaticFilesFrom(Path.projectPaths.rootDirectory.getChild('public'))
  .addRouter('', getCMSWebServerRouter());

server.exposeToInternetOnPort(port, () =>
  console.log(`Server running on http://localhost:${port}`),
);
