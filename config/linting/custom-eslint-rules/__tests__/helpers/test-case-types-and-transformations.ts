import type {
  InvalidTestCase,
  ValidTestCase,
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
    code: createTestCase(description, parameters),
    filename: parameters.currentFilePath,
  }));
}

export function errorTestCasesToInvalidRuleTesterCases<
  MessageIds extends string
>(cases: ErrorTestCase<MessageIds>[]): InvalidTestCase<MessageIds, []>[] {
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
