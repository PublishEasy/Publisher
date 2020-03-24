import { render, RenderResult } from '@testing-library/react';

export class ReactTester {
  private testingLibraryQueries: RenderResult | null;
  private renderError: Error | null = null;

  constructor(reactElement: JSX.Element) {
    try {
      this.testingLibraryQueries = render(reactElement);
    } catch (e) {
      this.testingLibraryQueries = null;
      this.renderError = e;
    }
  }

  assertRenders(): ReactTester {
    expect(this.renderError).toBe(null);
    expect(this.testingLibraryQueries).not.toBe(null);
    return this;
  }

  assertHasFieldWithLabel(label: string): ReactTester {
    const queries = this.getQueries();
    try {
      queries.getByLabelText(label);
    } catch (e) {
      throw new Error(`Node has no element with label ${label}`);
    }
    return this;
  }

  assertHasButtonNamed(name: string): ReactTester {
    const queries = this.getQueries();
    try {
      queries.getByRole('button', { name });
    } catch (e) {
      const testingLibraryError: string = e.message;
      const buttons = testingLibraryError.match(
        /^\s+-+$\n\s+button:[\s\S]+^\s+-+$/gm,
      );
      const buttonsString: string = (buttons || []).join('\n');
      this.throwError(
        `Node has no button with name ${name}\nAccessible buttons in node:\n${buttonsString}`,
      );
    }
    return this;
  }

  private getQueries(): RenderResult {
    if (this.testingLibraryQueries === null) {
      throw new Error(
        'There seems to have been an issue rendering the React element. Remember to call assertRenders before anything else',
      );
    }
    return this.testingLibraryQueries;
  }

  private throwError(errorMessage: string): never {
    const error = new Error(errorMessage);
    const dirtyStackTrace = error.stack || '';
    const dirtyStackLines = dirtyStackTrace
      .split('\n')
      .filter((line) => /^\s+at /.test(line));
    const cleanStackLines = dirtyStackLines.filter(
      (line) => line.includes(this.constructor.name) === false,
    );
    // Extra newline at beginning is for formatting from experience
    const cleanStackStrace = '\n' + cleanStackLines.join('\n');

    const cleanError = error;
    cleanError.stack = cleanStackStrace;

    throw cleanError;
  }
}
