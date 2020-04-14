import { HTTPAsserter } from './helpers/http-asserter';
import {
  getMultipleRouterServerWithGETRoutesAt,
  getServerWithGETRoutesAt,
  getServerWithWildcardGETandMiddleware,
  setWildcardRouteThroughNormalMethod,
} from './helpers/serverBuilders';

import type { NodeHTTPServer, Middleware, Response } from '../types';

describe('ProductionWebServer/ConcreteRouter', () => {
  describe('exposing port', () => {
    let server: NodeHTTPServer;
    const workingPath = '/works';

    beforeEach((done) => {
      server = getServerWithGETRoutesAt(workingPath).exposeToInternetOnPort(
        getRandomPort(),
        done,
      );
    });

    afterEach((done) => server.close(done));

    it('returns 404 on missing route', (done) => {
      new HTTPAsserter(server).get('/').expectStatusCode(404, done);
    });

    it('finds the working path', (done) => {
      new HTTPAsserter(server).get(workingPath).expectStatusCode(200, done);
    });
  });
  describe('wildcard route usage', () => {
    it('doesnt allow setting wildcard route with normal method', () => {
      expect(setWildcardRouteThroughNormalMethod).toThrowError('wildcard');
    });
    it('throws if several routers put on same prefix', () => {
      expect(() =>
        getMultipleRouterServerWithGETRoutesAt(
          { pathPrefix: '/prefix', routes: [] },
          { pathPrefix: '/prefix', routes: [] },
        ).toNodeHttpServer(),
      ).toThrowError(/multiple routers.*prefix/i);
      expect(() =>
        getMultipleRouterServerWithGETRoutesAt(
          { pathPrefix: '', routes: [] },
          { pathPrefix: '', routes: [] },
        ).toNodeHttpServer(),
      ).toThrowError(/multiple routers.*prefix/i);
    });
    it('matches specific routes before wildcard even if wildcard defined first in single router', (done) => {
      const server = getServerWithGETRoutesAt('*', {
        pathPattern: '/test',
        response: 'specific route',
      });
      new HTTPAsserter(server.toNodeHttpServer())
        .get('/test')
        .expectStatusCode(200)
        .expectResponse('specific route', done);
    });
    it('matches specific routes before wildcard even if overlapping wildcard defined in separate preceding router', (done) => {
      const server = getMultipleRouterServerWithGETRoutesAt(
        { pathPrefix: '', routes: ['*'] },
        {
          pathPrefix: '/prefix',
          routes: [
            {
              pathPattern: '/test',
              response: 'specific route',
            },
          ],
        },
      );
      new HTTPAsserter(server.toNodeHttpServer())
        .get('/prefix/test')
        .expectStatusCode(200)
        .expectResponse('specific route', done);
    });
    it('doesnt allow several wildcards in one router', () => {
      expect(() => getServerWithGETRoutesAt('*', '*')).toThrowError(
        'wildcard routes',
      );
    });
  });
  it('correctly finds a route set with a router prefix', (done) => {
    const server = getMultipleRouterServerWithGETRoutesAt({
      pathPrefix: '/prefix',
      routes: ['/test'],
    });
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/prefix/test')
      .expectStatusCode(200, done);
  });
  it('doesnt match a router route when prefix not included', (done) => {
    const server = getMultipleRouterServerWithGETRoutesAt({
      pathPrefix: '/prefix',
      routes: ['/test'],
    });
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/test')
      .expectStatusCode(404, done);
  });
  it('returns 404 for route when no router added', (done) => {
    const server = getServerWithGETRoutesAt();
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/')
      .expectStatusCode(404, done);
  });
  it('calls a wildcard get handler for `/`', (done) => {
    const server = getServerWithGETRoutesAt('*');
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/')
      .expectStatusCode(200, done);
  });
  it('calls a wildcard get handler for empty path', (done) => {
    const server = getServerWithGETRoutesAt('*');
    new HTTPAsserter(server.toNodeHttpServer())
      .get('')
      .expectStatusCode(200, done);
  });
  it('calls a wildcard get handler for path with one part', (done) => {
    const server = getServerWithGETRoutesAt('*');
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/firstpart')
      .expectStatusCode(200, done);
  });
  it('calls a wildcard get handler for path with two parts', (done) => {
    const server = getServerWithGETRoutesAt('*');
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/firstpart/secondpart')
      .expectStatusCode(200, done);
  });
  it('calls a hardcoded route when path matches exactly', (done) => {
    const server = getServerWithGETRoutesAt('/hardcoded');
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/hardcoded')
      .expectStatusCode(200, done);
  });
  it("doesn't call a hardcoded route when route is not a substring of path ", (done) => {
    const server = getServerWithGETRoutesAt('/hardcoded');
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/wrong')
      .expectStatusCode(404, done);
  });
  it("doesn't call a hardcoded route when route is not exact match but is a substring of path ", (done) => {
    const server = getServerWithGETRoutesAt('/hardcoded');
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/hardcoded/wrong')
      .expectStatusCode(404, done);
  });
  it('calls router middlewares in same order as provided followed by the route', (done) => {
    const values: number[] = [];
    const firstMiddleware: Middleware = (req, res, next) => {
      values.push(1);
      next();
    };
    const secondMiddleware: Middleware = (req, res, next) => {
      values.push(2);
      next();
    };
    const routeHandler = jest.fn((_, res: Response) => {
      res.sendStatus(200);
    });
    const server = getServerWithWildcardGETandMiddleware(
      routeHandler,
      firstMiddleware,
      secondMiddleware,
    );
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/path')
      .customExpect(() => {
        expect(values).toEqual([1, 2]);
        expect(routeHandler).toHaveBeenCalledTimes(1);
      }, done);
  });
});

function getRandomPort(): number {
  // These numbers are taken from https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers
  const min = 1024;
  const max = 49151;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
