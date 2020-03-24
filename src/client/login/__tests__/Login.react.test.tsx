import React from 'react';

import { Login } from 'src/client/login/Login';
import { ReactTester } from 'src/client/test-utilities/react-tester';

const getLoginTester: () => ReactTester = () => new ReactTester(<Login />);

describe('Login', () => {
  it('renders without crashing', () => {
    getLoginTester().assertRenders();
  });

  it('has an email field', () => {
    getLoginTester().assertHasFieldWithLabel('Email');
  });

  it('has a password field', () => {
    getLoginTester().assertHasFieldWithLabel('Password');
  });

  it('has a login button', () => {
    getLoginTester().assertHasButtonNamed('Login');
  });
});
