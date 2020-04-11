/** Copied and modified from https://github.com/typescript-eslint/typescript-eslint/blob/2ccd66b920816d54cc1a639059f60410df665900/packages/eslint-plugin/tests/RuleTester.ts */
import { TSESLint } from '@typescript-eslint/experimental-utils';
import { clearCaches } from '@typescript-eslint/parser';
import path from 'path';

export class CustomRuleTester<
  MessageIds extends string
> extends TSESLint.RuleTester {
  private rule: TSESLint.RuleModule<MessageIds, []>;
  constructor(rule: TSESLint.RuleModule<MessageIds, []>) {
    super({
      // as of eslint 6 you have to provide an absolute path to the parser
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: { sourceType: 'module', ecmaVersion: 2019 },
    });
    this.rule = rule;
  }

  run(): never {
    throw new Error('use runTests instead which has a simplified interface');
  }

  runTests(...tests: TSESLint.RunTests<MessageIds, []>[]): void {
    const allTests = this.mergeTests(tests);
    const standardizedTests = this.standardizeValidTests(allTests);
    super.run(this.getRuleName(), this.rule, standardizedTests);
  }

  private mergeTests(
    tests: TSESLint.RunTests<MessageIds, []>[],
  ): TSESLint.RunTests<MessageIds, []> {
    return tests.reduce(
      (
        prev: TSESLint.RunTests<MessageIds, []>,
        next: TSESLint.RunTests<MessageIds, []>,
      ): TSESLint.RunTests<MessageIds, []> => {
        return {
          valid: [...prev.valid, ...next.valid],
          invalid: [...prev.invalid, ...next.invalid],
        };
      },
      { valid: [], invalid: [] },
    );
  }

  private standardizeValidTests(
    tests: TSESLint.RunTests<MessageIds, []>,
  ): TSESLint.RunTests<MessageIds, []> {
    return {
      ...tests,
      valid: tests.valid.map((test) => {
        if (typeof test === 'string') {
          return {
            code: test,
          };
        }
        return test;
      }),
    };
  }

  private getRuleName(): string {
    const ruleTestFilePath = getCallerFile();
    if (!ruleTestFilePath)
      throw new Error(
        "Error getting rule name from file path. Couldn't find filepath of caller",
      );
    return this.getRuleNameFromTestPath(ruleTestFilePath);
  }

  private getRuleNameFromTestPath(testPath: string): string {
    const filename = path.basename(testPath);
    return filename.split('.')[0];
  }
}

// make sure that the parser doesn't hold onto file handles between tests
// on linux (i.e. our CI env), there can be very a limited number of watch handles available
afterAll(() => {
  clearCaches();
});

/** Taken and modified from https://stackoverflow.com/a/19788257 */
function getCallerFile(): string | undefined {
  const originalPrepareStackTrace = Error.prepareStackTrace;
  const resetErrorPrototype = (): void => {
    Error.prepareStackTrace = originalPrepareStackTrace;
  };
  Error.prepareStackTrace = (_, stack): NodeJS.CallSite[] => stack;

  const err = new Error();
  const stack: NodeJS.CallSite[] | undefined = (err.stack as unknown) as
    | NodeJS.CallSite[]
    | undefined;

  const currentfile = stack?.shift()?.getFileName();

  while (currentfile && stack?.length) {
    const callerfile = stack.shift()?.getFileName();

    if (
      callerfile &&
      currentfile !== callerfile &&
      callerfile.endsWith('.test.ts')
    ) {
      resetErrorPrototype();
      return callerfile;
    }
  }
  resetErrorPrototype();
  return undefined;
}
