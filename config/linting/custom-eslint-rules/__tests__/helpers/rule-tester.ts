/** Copy pasted with some deletions from https://github.com/typescript-eslint/typescript-eslint/blob/2ccd66b920816d54cc1a639059f60410df665900/packages/eslint-plugin/tests/RuleTester.ts */
import { TSESLint } from '@typescript-eslint/experimental-utils';
import { clearCaches } from '@typescript-eslint/parser';

const parser = '@typescript-eslint/parser';

type RuleTesterConfig = Omit<TSESLint.RuleTesterConfig, 'parser'> & {
  parser: typeof parser;
};

export class RuleTester extends TSESLint.RuleTester {
  // as of eslint 6 you have to provide an absolute path to the parser
  // but that's not as clean to type, this saves us trying to manually enforce
  // that contributors require.resolve everything
  constructor(options: RuleTesterConfig) {
    super({
      ...options,
      parser: require.resolve(options.parser),
    });
  }
  // as of eslint 6 you have to provide an absolute path to the parser
  // If you don't do that at the test level, the test will fail somewhat cryptically...
  // This is a lot more explicit
  run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    name: string,
    rule: TSESLint.RuleModule<TMessageIds, TOptions>,
    tests: TSESLint.RunTests<TMessageIds, TOptions>,
  ): void {
    const errorMessage = `Do not set the parser at the test level unless you want to use a parser other than ${parser}`;

    // standardize the valid tests as objects
    tests.valid = tests.valid.map((test) => {
      if (typeof test === 'string') {
        return {
          code: test,
        };
      }
      return test;
    });

    tests.valid.forEach((test) => {
      if (typeof test !== 'string') {
        if (test.parser === parser) {
          throw new Error(errorMessage);
        }
      }
    });
    tests.invalid.forEach((test) => {
      if (test.parser === parser) {
        throw new Error(errorMessage);
      }
    });

    super.run(name, rule, tests);
  }
}

// make sure that the parser doesn't hold onto file handles between tests
// on linux (i.e. our CI env), there can be very a limited number of watch handles available
afterAll(() => {
  clearCaches();
});
