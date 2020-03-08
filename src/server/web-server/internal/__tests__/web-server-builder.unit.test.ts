import createTestRequester from 'supertest';

import { WebServerBuilder } from '../web-server-builder';

describe('ProductionWebServer', () => {
  it.skip('calls a wildcard get handler for `/`', done => {
    const server = new WebServerBuilder();
    // const handlerMock = jest
    //   .fn()
    //   .mockImplementation((req, res) => res.sendStatus(200));
    createTestRequester(server.toNodeHttpServer())
      .get('/')
      .expect(200, done);
  });
  it.todo('calls a wildcard get handler for empty path');
  it.todo('calls a wildcard get handler for path with one part');
  it.todo('calls a wildcard get handler for path with two parts');
  it.todo('calls a hardcoded route when path matches exactly');
  it.todo(
    "doesn't call a hardcoded route when route is not a substring of path ",
  );
  it.todo(
    "doesn't call a hardcoded route when route is not exact match but is a substring of path ",
  );
  it.todo(
    'calls universal middlewares in same order as provided followed by the route',
  );
  it.todo(
    'calls specific path middlewares when path matches in same order as provided followed by the route',
  );
  it.todo(
    "doesn't call middlewares set on specific path if path doesn't match. It still calls matching route though",
  );
});
