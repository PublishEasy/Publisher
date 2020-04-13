import React from 'react';

import { Login } from 'src/common/components/login/Login';
import { ReactTester } from 'src/common/components/test-utilities/react-tester';
import { ROUTES } from 'src/common/routes';

const INITIAL_PATH = ROUTES.login;

const getLoginTester: () => ReactTester = () =>
  new ReactTester(<Login />, INITIAL_PATH);

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

    it('stays on initial path when no credentials provided', () => {
      getLoginTester().clickButtonNamed('Login').assertURLPathIs(INITIAL_PATH);
    });

    it('stays on initial path when wrong credentials provided', () => {
      const loginInfo = {
        email: 'wrong@gmail.com',
        password: 'wrongpassword',
      };
      const tester = getFilledFormTester(loginInfo);
      tester.clickButtonNamed('Login').assertURLPathIs(INITIAL_PATH);
    });

    it('redirects to homepage when correct credentials provided', () => {
      const loginInfo = {
        email: 'user@gmail.com',
        password: 'password',
      };
      const tester = getFilledFormTester(loginInfo);
      tester.clickButtonNamed('Login').async.assertURLPathIs(ROUTES.homepage);
    });
  });
});

function getFilledFormTester({
  email,
  password,
}: {
  email: string;
  password: string;
}): ReactTester {
  const tester = getLoginTester();
  tester.getFieldLabelled('Email').type(email);
  tester.getFieldLabelled('Password').type(password);
  return tester;
}
