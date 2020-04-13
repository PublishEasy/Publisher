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

  expectStatusCode(
    statusCode: number,
    doneCallback?: jest.DoneCallback,
  ): HTTPAsserter {
    const asserter = this.getReadyAsserter();
    this.asserter = asserter.expect(statusCode);
    this.handleDoneCallback(doneCallback);
    return this;
  }

  expectResponse(
    response: string,
    doneCallback?: jest.DoneCallback,
  ): HTTPAsserter {
    const asserter = this.getReadyAsserter();
    this.asserter = asserter.expect(response);
    this.handleDoneCallback(doneCallback);
    return this;
  }

  private handleDoneCallback(doneCallback?: jest.DoneCallback): void {
    const asserter = this.getReadyAsserter();
    if (doneCallback) this.asserter = asserter.end(doneCallback);
  }

  private getReadyAsserter(): supertest.Test {
    if (!this.asserter)
      throw new Error(
        'Asserter not initialized before expect call, remember to make a request through a method first',
      );
    return this.asserter;
  }

  customExpect(
    expectCallback: () => void,
    doneCallback: jest.DoneCallback,
  ): void {
    if (!this.asserter)
      throw new Error(
        'Asserter not initialized before expect call, remember to make a request through a method first',
      );
    this.asserter.expect(expectCallback).end(doneCallback);
  }
}
