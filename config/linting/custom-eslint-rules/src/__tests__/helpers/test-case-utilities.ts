import type { TSESLint } from '@typescript-eslint/experimental-utils';

type ValidImportTestCase = {
  description: string;
  parameters: { currentFilePath: string; importPath: string };
};

type ErrorImportTestCase<MessageIds extends string> = ValidImportTestCase & {
  errorMessageIds: MessageIds[];
};

export type ImportTestCase<MessageIds extends string> = {
  valid: ValidImportTestCase[];
  invalid: ErrorImportTestCase<MessageIds>[];
};

export function buildImportTestCase<MessageIds extends string>(
  testCase: ImportTestCase<MessageIds>,
): TSESLint.RunTests<MessageIds, []> {
  return {
    valid: testCasesToValidRuleTesterCases(testCase.valid),
    invalid: errorTestCasesToInvalidRuleTesterCases(testCase.invalid),
  };
}

function testCasesToValidRuleTesterCases(
  cases: ValidImportTestCase[],
): TSESLint.ValidTestCase<[]>[] {
  return cases.map(({ description, parameters }) => ({
    code: createTestCase(description, parameters),
    filename: parameters.currentFilePath,
  }));
}

function errorTestCasesToInvalidRuleTesterCases<MessageIds extends string>(
  cases: ErrorImportTestCase<MessageIds>[],
): TSESLint.InvalidTestCase<MessageIds, []>[] {
  return cases.map(({ description, parameters, errorMessageIds }) => ({
    code: createTestCase(description, parameters),
    filename: parameters.currentFilePath,
    errors: errorMessageIds.map((messageId) => ({ messageId })),
  }));
}

function createTestCase(
  description: string,
  parameters: { currentFilePath: string; importPath: string },
): string {
  return `\
// ${description}
import a from '${parameters.importPath}';`;
}
