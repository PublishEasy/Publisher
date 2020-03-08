import { NodeHTTPServer } from './dependencies';

import type { RouterSpec } from './types';

export class WebServerBuilder {
  // private expressApplication: ExpressApplication;
  // constructor() {
  //   this.expressApplication = getExpressApplication();
  // }
  addRouter(
    _pathPrefix: string,
    _routerSpecification: RouterSpec,
  ): WebServerBuilder {
    // this.expressApplication.use(pathPrefix, router);
    return this;
  }
  toNodeHttpServer(): NodeHTTPServer {
    return new NodeHTTPServer();
  }
}
