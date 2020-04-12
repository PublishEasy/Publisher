import { RequestLogger } from 'testcafe';

const logger = RequestLogger(/^http:\/\/localhost:8080/);

fixture`Homepage`.page`http://localhost:8080`;

test.requestHooks(logger)(
  'Test that it renders login without crashing',
  async (t) => {
    await t.expect(logger.requests.length).eql(1);
    await t
      .expect(logger.count((request) => request.response.statusCode === 200))
      .eql(1);
  },
);

fixture`Non existent page`.page`http://localhost:8080/does/not/exist`;
test.requestHooks(logger)(
  'Test that it returns 404 for unrecognized page',
  async (t) => {
    await t.expect(logger.requests.length).eql(1);
    await t
      .expect(logger.count((request) => request.response.statusCode === 404))
      .eql(1);
  },
);

fixture`Login page`.page`http://localhost:8080/login`;
test.requestHooks(logger)(
  'Test that it renders login page without crashing',
  async (t) => {
    await t.expect(logger.requests.length).eql(1);
    await t
      .expect(logger.count((request) => request.response.statusCode === 200))
      .eql(1);
  },
);
