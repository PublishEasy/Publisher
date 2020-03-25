import React from 'react';

import { Login } from 'src/client/login/Login';
import { ReactTester } from 'src/client/test-utilities/react-tester';

const getLoginTester: () => ReactTester = () => new ReactTester(<Login />);

describe('Login', () => {
  it('renders without crashing', () => {
    getLoginTester().assertRenders();
  });

  describe('email field', () => {
    it('exists', () => {
      getLoginTester().assertHasFieldWithLabel('Email');
    });

    it('is a functioning input field', () => {
      getLoginTester().getFieldByLabel('Email').assertIsFunctioningField();
    });
  });

  describe('password field', () => {
    it('exists', () => {
      getLoginTester().assertHasFieldWithLabel('Password');
    });

    it('is a functioning input field', () => {
      getLoginTester().getFieldByLabel('Password').assertIsFunctioningField();
    });

    it('is password input', () => {
      getLoginTester().getFieldByLabel('Password').isPasswordField();
    });
  });

  it('has a login button', () => {
    getLoginTester().assertHasButtonNamed('Login');
  });
});
