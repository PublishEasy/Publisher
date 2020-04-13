import { RequestLogger, Selector } from 'testcafe';

export class E2ETester {
  private initialPageUrl: string;
  constructor({
    name,
    initialPageUrl,
  }: {
    name: string;
    initialPageUrl: string;
  }) {
    fixture(name).page(initialPageUrl);
    this.initialPageUrl = initialPageUrl;
  }

  assertStatusCode(statusCode: number): this {
    const { initialPageUrl } = this;
    test.requestHooks(logger)(
      `Renders with status code ${statusCode}`,
      async (t) => {
        const numMainRequests = logger.count((logEntry) =>
          isMainRequestUrl(logEntry.request.url),
        );
        await t.expect(numMainRequests).eql(1);
        const numMainRequestsWithExpectedStatusCode = logger.count(
          (logEntry) =>
            isMainRequestUrl(logEntry.request.url) &&
            logEntry.response.statusCode === statusCode,
        );
        await t.expect(numMainRequestsWithExpectedStatusCode).eql(1);

        function isMainRequestUrl(url: string): boolean {
          return url === initialPageUrl;
        }
      },
    );
    return this;
  }

  containsText(text: string): this {
    test(`Page contains text '${text}'`, async (t) => {
      await t.expect(Selector('#root').textContent).contains(text);
    });
    return this;
  }

  containsCssSelectorMatch(selector: string): this {
    test(`Page contains node matching selector '${selector}'`, async (t) => {
      await t.expect(Selector(selector).exists).ok();
    });
    return this;
  }
}

const logger = RequestLogger(/.*/);
