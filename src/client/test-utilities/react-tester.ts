// eslint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom/extend-expect';

import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

class Tester {
  protected throwError(errorMessage: string): never {
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

export class ReactTester extends Tester {
  private testingLibraryQueries: RenderResult | null;
  private renderError: Error | null = null;

  constructor(reactElement: JSX.Element) {
    super();
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

  getFieldByLabel(label: string): HTMLElementTester {
    const queries = this.getQueries();
    const field = queries.getByLabelText(label);
    return new HTMLElementTester(field);
  }

  private getQueries(): RenderResult {
    if (this.testingLibraryQueries === null) {
      throw new Error(
        'There seems to have been an issue rendering the React element. Remember to call assertRenders before anything else',
      );
    }
    return this.testingLibraryQueries;
  }
}

class HTMLElementTester extends Tester {
  private element: HTMLElement;

  constructor(element: HTMLElement) {
    super();
    this.element = element;
  }

  assertIsFunctioningField(): HTMLElementTester {
    expect(this.element).toHaveValue('');
    userEvent.type(this.element, 'abc');
    expect(this.element).toHaveValue('abc');
    return this;
  }

  isPasswordField(): HTMLElementTester {
    /**
     * The HTML semantics of input and password type are important here
     * because it means browsers can treat them right by hiding the input
     * and letting password managers detect them etc.
     */
    expect(this.element.tagName).toBe('INPUT');
    expect(this.element).toHaveAttribute('type', 'password');
    return this;
  }
}
