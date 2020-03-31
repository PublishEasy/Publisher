import React from 'react';

import { Login } from 'src/client/login/Login';
import { ReactTester } from 'src/client/test-utilities/react-tester';
import { ROUTES } from 'src/common/routes';

const getLoginTester: () => ReactTester = () =>
  new ReactTester(<Login />, ROUTES.login);

describe('Login', () => {
  it('renders without crashing', () => {
    getLoginTester().assertRenders();
  });

  describe('email field', () => {
    it('exists', () => {
      getLoginTester().assertHasFieldLabelled('Email');
    });

    it('is a functioning input field', () => {
      getLoginTester().getFieldLabelled('Email').assertIsFunctioningField();
    });
  });

  describe('password field', () => {
    it('exists', () => {
      getLoginTester().assertHasFieldLabelled('Password');
    });

    it('is a functioning input field', () => {
      getLoginTester().getFieldLabelled('Password').assertIsFunctioningField();
    });

    it('is password input', () => {
      getLoginTester().getFieldLabelled('Password').assertIsPasswordField();
    });
  });

  describe('login button', () => {
    it('exists', () => {
      getLoginTester().assertHasButtonNamed('Login');
    });

    it('redirects to root when logged in', () => {
      getLoginTester().clickButtonNamed('Login').assertURLPathIs('/');
    });
  });
});
