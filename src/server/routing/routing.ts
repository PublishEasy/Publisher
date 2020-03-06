import express from 'express';

type RouterGetter = (middleware: express.RequestHandler[]) => express.Router;
const getAuthenticationServerRouter: RouterGetter = middleware => {
  return getRouter(middleware, new AuthenticationRoutingStrategy());
};

const getCMSWebServerRouter: RouterGetter = middleware => {
  const router = express.Router();
  router.use(middleware);
};

function getRouter(
  middleware: express.RequestHandler[],
  routingStrategy: RoutingStrategy,
) {
  const router = express.Router();
  router.use(middleware);
  routingStrategy.applyRoutes(router);
  return router;
}

interface RoutingStrategy {
  applyRoutes(router: express.Router): void;
}

class AuthenticationRoutingStrategy implements RoutingStrategy {
  applyRoutes(router) {
    router.get('/', (req, res) => res.send('Authentication'));
  }
}
