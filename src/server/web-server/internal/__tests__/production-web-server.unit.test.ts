import { HTTPAsserter } from './helpers/http-asserter';
import {
  getServerWithGETRoutesAt,
  getServerWithWildcardGETandMiddleware,
} from './helpers/serverBuilders';

import type { NodeHTTPServer, Middleware } from '../types';

describe('ProductionWebServer', () => {
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
      new HTTPAsserter(server).get('/').expect(404, done);
    });

    it('finds the working path', (done) => {
      new HTTPAsserter(server).get(workingPath).expect(200, done);
    });
  });
  it('returns 404 for route when no router added', (done) => {
    const server = getServerWithGETRoutesAt();
    new HTTPAsserter(server.toNodeHttpServer()).get('/').expect(404, done);
  });
  it('calls a wildcard get handler for `/`', (done) => {
    const server = getServerWithGETRoutesAt('*');
    new HTTPAsserter(server.toNodeHttpServer()).get('/').expect(200, done);
  });
  it('calls a wildcard get handler for empty path', (done) => {
    const server = getServerWithGETRoutesAt('*');
    new HTTPAsserter(server.toNodeHttpServer()).get('').expect(200, done);
  });
  it('calls a wildcard get handler for path with one part', (done) => {
    const server = getServerWithGETRoutesAt('*');
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/firstpart')
      .expect(200, done);
  });
  it('calls a wildcard get handler for path with two parts', (done) => {
    const server = getServerWithGETRoutesAt('*');
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/firstpart/secondpart')
      .expect(200, done);
  });
  it('calls a hardcoded route when path matches exactly', (done) => {
    const server = getServerWithGETRoutesAt('/hardcoded');
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/hardcoded')
      .expect(200, done);
  });
  it("doesn't call a hardcoded route when route is not a substring of path ", (done) => {
    const server = getServerWithGETRoutesAt('/hardcoded');
    new HTTPAsserter(server.toNodeHttpServer()).get('/wrong').expect(404, done);
  });
  it("doesn't call a hardcoded route when route is not exact match but is a substring of path ", (done) => {
    const server = getServerWithGETRoutesAt('/hardcoded');
    new HTTPAsserter(server.toNodeHttpServer())
      .get('/hardcoded/wrong')
      .expect(404, done);
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
    const routeHandler = jest.fn((req, res) => {
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
