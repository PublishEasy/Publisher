// eslint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom/extend-expect';

import { render, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';

class Tester {
  protected throwError(errorDescriptor: string | Error): never {
    const error =
      errorDescriptor instanceof Error
        ? errorDescriptor
        : new Error(errorDescriptor);
    const cleanError = this.buildCleanError(error);
    throw cleanError;
  }

  private buildCleanError(error: Error): Error {
    const dirtyStackTrace = error.stack || '';
    const dirtyStackLines = dirtyStackTrace
      .split('\n')
      .filter((line) => /^\s+at /.test(line));
    const cleanStackLines = dirtyStackLines.filter(
      (line) => line.includes(this.constructor.name) === false,
    );
    // Extra newline at beginning is for formatting from experience
    const cleanStackStrace = '\n' + cleanStackLines.join('\n');
    const cleanError = new Error(error.message);
    cleanError.stack = cleanStackStrace;
    return cleanError;
  }
}

export class ReactTester extends Tester {
  private testingLibraryQueries: RenderResult | null;
  private renderError: Error | null = null;
  private currentUrlPath: string | null = null;
  private asyncAssert = false;

  constructor(reactNode: React.ReactNode, initialPath = '/') {
    super();
    try {
      this.testingLibraryQueries = render(
        <MemoryRouter initialEntries={[initialPath]}>
          {/* This route will keep track of the current location */}
          <Route
            render={({ location }): React.ReactNode => {
              this.currentUrlPath = location.pathname;
              return null;
            }}
          />
          {reactNode}
        </MemoryRouter>,
      );
    } catch (e) {
      const error = e instanceof Error ? e : new Error(e);
      this.testingLibraryQueries = null;
      this.renderError = error;
    }
  }

  assertRenders(): this {
    if (this.renderError !== null) this.throwError(this.renderError);
    expect(this.testingLibraryQueries).not.toBe(null);
    return this;
  }

  assertHasFieldLabelled(label: string): this {
    const queries = this.getQueries();
    try {
      queries.getByLabelText(label);
    } catch (e) {
      throw new Error(`Node has no element with label ${label}`);
    }
    return this;
  }

  assertHasButtonNamed(name: string): this {
    const queries = this.getQueries();
    try {
      queries.getByRole('button', { name });
    } catch (e) {
      const error = e instanceof Error ? e : new Error(e);
      const testingLibraryError: string = error.message;
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

  getFieldLabelled(label: string): HTMLElementTester {
    this.assertHasFieldLabelled(label);
    const queries = this.getQueries();
    const field = queries.getByLabelText(label);
    return new HTMLElementTester(field);
  }

  clickButtonNamed(name: string): this {
    this.assertHasButtonNamed(name);
    const queries = this.getQueries();
    const button = queries.getByRole('button', { name });
    userEvent.click(button);
    return this;
  }

  assertURLPathIs(path: string): this {
    if (this.asyncAssert) {
      waitFor(() => expect(this.currentUrlPath).toBe(path));
    } else {
      expect(this.currentUrlPath).toBe(path);
    }
    return this;
  }

  get async(): this {
    this.asyncAssert = true;
    return this;
  }

  private getQueries(): RenderResult {
    if (this.testingLibraryQueries === null) {
      this.throwError(
        `There seems to have been an issue rendering the React element. Remember to call assertRenders in a test and make sure that passes. The error was:\n${this.renderError}`,
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

  type(text: string): this {
    userEvent.type(this.element, text);
    return this;
  }

  assertIsFunctioningField(): this {
    expect(this.element).toHaveValue('');
    userEvent.type(this.element, 'abc');
    expect(this.element).toHaveValue('abc');
    return this;
  }

  assertIsPasswordField(): this {
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
