import type {
  InvalidTestCase,
  ValidTestCase,
  TestCaseError,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';

export type TestCase = {
  description: string;
  parameters: { currentFilePath: string; importPath: string };
};

export type ErrorTestCase<MessageIds extends string> = TestCase & {
  errorMessageIds: MessageIds[];
};

export function testCasesToValidRuleTesterCases(
  cases: TestCase[],
): ValidTestCase<[]>[] {
  return cases.map(({ description, parameters }) => ({
    code: `\
// ${description}
import a from '${parameters.importPath}';`,
    filename: parameters.currentFilePath,
  }));
}

export function errorTestCasesToInvalidRuleTesterCases<MessageIds extends string>(
  cases: ErrorTestCase<MessageIds>[],
): InvalidTestCase<MessageIds, []>[] {
  return cases.map(({ description, parameters, errorMessageIds }) => ({
    code: `\
// ${description}
import a from '${parameters.importPath}';`,
    filename: parameters.currentFilePath,
    // Following the type correctly makes the tests fail, so the types must
    // be somehow out of sync with the RuleTester implementation we have
    errors: (errorMessageIds as unknown )as TestCaseError<MessageIds>[],
  }));
}