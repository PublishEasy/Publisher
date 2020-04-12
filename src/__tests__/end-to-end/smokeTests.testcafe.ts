import { E2ETester } from './helpers/e2e-tester';

const baseUrl = 'http://localhost:8080';

new E2ETester({
  name: 'Homepage',
  initialPageUrl: `${baseUrl}/`,
})
  .assertStatusCode(200)
  .containsText('Login');

new E2ETester({
  name: 'Login Page',
  initialPageUrl: `${baseUrl}/login`,
})
  .assertStatusCode(200)
  .containsCssSelectorMatch('input');

new E2ETester({
  name: 'Non existent page',
  initialPageUrl: `${baseUrl}/does/not/exist`,
}).assertStatusCode(404);
