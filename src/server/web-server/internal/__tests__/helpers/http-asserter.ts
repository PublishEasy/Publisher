import type { Server as NodeHTTPServer } from 'http';
import supertest from 'supertest';

export class HTTPAsserter {
  private supertestInstance: supertest.SuperTest<supertest.Test>;
  private asserter: supertest.Test | null;

  constructor(server: NodeHTTPServer) {
    this.supertestInstance = supertest(server);
    this.asserter = null;
  }

  get(path: string): HTTPAsserter {
    this.asserter = this.supertestInstance.get(path);
    return this;
  }

  expect(statusCode: number, doneCallback?: jest.DoneCallback): HTTPAsserter {
    if (!this.asserter)
      throw new Error(
        'Asserter not initialized before expect call, remember to make a request through a method first',
      );
    this.asserter = this.asserter.expect(statusCode, doneCallback);
    return this;
  }
}
