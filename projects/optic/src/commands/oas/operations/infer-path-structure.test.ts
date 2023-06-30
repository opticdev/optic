import { it, expect } from '@jest/globals';
import { InferPathStructure } from './infer-path-structure';
import * as AT from '../lib/async-tools';
import { HttpMethods } from './index';
import { CapturedInteraction } from '../captures';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

const gitHubExample = [
  { pathPattern: '/users/{username}/events/public', methods: ['get'] },
  { pathPattern: '/users', methods: ['get'] },
  { pathPattern: '/users/{username}', methods: ['get'] },
  { pathPattern: '/users/{username}/events', methods: ['get'] },
  { pathPattern: '/users/{username}/events/orgs/{org}', methods: ['get'] },
  { pathPattern: '/users/{username}/followers', methods: ['get'] },
  { pathPattern: '/users/{username}/following', methods: ['get'] },
  {
    pathPattern: '/users/{username}/following/{target_user}',
    methods: ['get'],
  },
  { pathPattern: '/users/{username}/gists', methods: ['get'] },
  { pathPattern: '/users/{username}/gpg_keys', methods: ['get'] },
  { pathPattern: '/users/{username}/gpg_keys', methods: ['post'] },
  { pathPattern: '/users/{username}/gpg_keys/{key}', methods: ['delete'] },
  { pathPattern: '/users/{username}/hovercard', methods: ['get'] },
  { pathPattern: '/users/{username}/installation', methods: ['get'] },
  { pathPattern: '/users/{username}/keys', methods: ['get'] },
  { pathPattern: '/users/{username}/keys', methods: ['post'] },
  { pathPattern: '/users/{username}/orgs', methods: ['get'] },
  { pathPattern: '/users/{username}/orgs', methods: ['post'] },
  { pathPattern: '/users/{username}/packages', methods: ['get'] },
  {
    pathPattern: '/users/{username}/packages/{package_type}/{package_name}',
    methods: ['get'],
  },
];

it('rebuilds a path structure from operations already in spec', () => {
  const pathStructure = new InferPathStructure(gitHubExample);
  expect(pathStructure['paths']).toMatchSnapshot();
});

it('will not learn paths it recognizes', () => {
  const pathStructure = new InferPathStructure(gitHubExample);
  expect(pathStructure.undocumentedPaths()).toEqual([]);
});

it('will learn entirely new paths', () => {
  const pathStructure = new InferPathStructure(gitHubExample);
  pathStructure.includeObservedUrlPath('get', '/todos');
  pathStructure.includeObservedUrlPath('post', '/todos');

  expect(pathStructure.undocumentedPaths()).toEqual([
    { methods: ['get', 'post'], pathPattern: '/todos', examplePath: '/todos' },
  ]);
});

it('can expand the structure from new patterns with obvious variables', () => {
  const pathStructure = new InferPathStructure([]);

  pathStructure.includeObservedUrlPath(
    'get',
    '/organizations/648/repositories/11221'
  );

  expect(pathStructure.undocumentedPaths()).toEqual([
    {
      methods: ['get'],
      pathPattern: '/organizations/{organization}/repositories/{repository}',
      examplePath: '/organizations/648/repositories/11221',
    },
  ]);
});

it('can suggest additional methods get added', () => {
  const pathStructure = new InferPathStructure([
    { methods: ['get'], pathPattern: '/orgs' },
  ]);

  pathStructure.includeObservedUrlPath('post', '/orgs');

  expect(pathStructure.undocumentedPaths()).toEqual([
    {
      methods: ['post'],
      pathPattern: '/orgs',
      examplePath: '/orgs',
    },
  ]);
});

it('can expand the structure from new patterns with hints in spec variables', () => {
  const pathStructure = new InferPathStructure([
    { methods: ['get'], pathPattern: '/organizations/{organization}' },
  ]);

  pathStructure.includeObservedUrlPath(
    'get',
    '/organizations/opticdev/members'
  );

  pathStructure.includeObservedUrlPath(
    'get',
    '/organizations/opticdev/members/1'
  );

  expect(pathStructure.undocumentedPaths()).toEqual([
    {
      methods: ['get'],
      pathPattern: '/organizations/{organization}/members',
      examplePath: '/organizations/opticdev/members',
    },
    {
      methods: ['get'],
      pathPattern: '/organizations/{organization}/members/{member}',
      examplePath: '/organizations/opticdev/members/1',
    },
  ]);
});

it('can reduce overlapping string constants to variables', () => {
  const pathStructure = new InferPathStructure([]);

  pathStructure.includeObservedUrlPath(
    'get',
    '/organizations/opticdev/repositories/optic'
  );
  pathStructure.includeObservedUrlPath(
    'get',
    '/organizations/opticdev/repositories/optic-10'
  );
  pathStructure.includeObservedUrlPath(
    'get',
    '/organizations/opticdev/repositories/fun'
  );

  pathStructure.includeObservedUrlPath(
    'get',
    '/organizations/acme-fun/repositories/demo'
  );

  pathStructure.includeObservedUrlPath('get', '/organizations/acme-fun');

  pathStructure.includeObservedUrlPath(
    'get',
    '/organizations/acme-fun/repositories/love'
  );

  pathStructure.includeObservedUrlPath(
    'get',
    '/organizations/Rosa/repositories/love'
  );

  pathStructure.replaceConstantsWithVariables();
  expect(pathStructure.undocumentedPaths()).toEqual([
    {
      methods: ['get'],
      pathPattern: '/organizations/{organization}',
      examplePath: '/organizations/opticdev',
    },
    {
      methods: ['get'],
      examplePath: '/organizations/opticdev/repositories/optic',
      pathPattern: '/organizations/{organization}/repositories/{repository}',
    },
  ]);
});

it('respects verified components', () => {
  const pathStructure = new InferPathStructure([
    { pathPattern: '/users/{username}/events/public', methods: ['get'] },
  ]);

  pathStructure.includeObservedUrlPath(
    'get',
    '/users/name-of-a-person/events/private'
  );

  pathStructure.replaceConstantsWithVariables();
  expect(pathStructure.undocumentedPaths()).toEqual([
    {
      methods: ['get'],
      pathPattern: '/users/{username}/events/private',
      examplePath: '/users/name-of-a-person/events/private',
    },
  ]);
});

it('can learn a variable component with constants after', () => {
  const pathStructure = new InferPathStructure([]);

  pathStructure.includeObservedUrlPath('get', '/users/name-of-a-person/events');

  pathStructure.includeObservedUrlPath(
    'get',
    '/users/othername-of-thing/repos'
  );

  pathStructure.includeObservedUrlPath(
    'get',
    '/users/othername-of-thing/favorites'
  );

  pathStructure.replaceConstantsWithVariables();
  expect(pathStructure.undocumentedPaths()).toEqual([
    {
      methods: ['get'],
      pathPattern: '/users/{user}/events',
      examplePath: '/users/name-of-a-person/events',
    },
    {
      methods: ['get'],
      pathPattern: '/users/{user}/repos',
      examplePath: '/users/othername-of-thing/repos',
    },
    {
      methods: ['get'],
      pathPattern: '/users/{user}/favorites',
      examplePath: '/users/othername-of-thing/favorites',
    },
  ]);
});

it('can learn a variable component with variables after', () => {
  const pathStructure = new InferPathStructure([]);

  pathStructure.includeObservedUrlPath('get', '/users/name-of-a-person/events');

  pathStructure.includeObservedUrlPath(
    'get',
    '/users/othername-of-thing/repos'
  );

  pathStructure.includeObservedUrlPath(
    'get',
    '/users/othername-of-thing/favorites'
  );

  pathStructure.includeObservedUrlPath(
    'get',
    '/users/othername-of-thing/repos/abc'
  );
  pathStructure.includeObservedUrlPath(
    'get',
    '/users/othername-of-thing/repos/def'
  );
  pathStructure.includeObservedUrlPath('get', '/users/OTHER-user/repos/xyz');

  pathStructure.replaceConstantsWithVariables();
  expect(pathStructure.undocumentedPaths()).toEqual([
    {
      methods: ['get'],
      pathPattern: '/users/{user}/events',
      examplePath: '/users/name-of-a-person/events',
    },
    {
      methods: ['get'],
      pathPattern: '/users/{user}/repos',
      examplePath: '/users/othername-of-thing/repos',
    },
    {
      methods: ['get'],
      pathPattern: '/users/{user}/favorites',
      examplePath: '/users/othername-of-thing/favorites',
    },
    {
      methods: ['get'],
      pathPattern: '/users/{user}/repos/{repo}',
      examplePath: '/users/othername-of-thing/repos/abc',
    },
  ]);
});

it('can multiple top level resources ', () => {
  const pathStructure = new InferPathStructure([]);

  pathStructure.includeObservedUrlPath('get', '/orders/3/products');
  pathStructure.includeObservedUrlPath('get', '/orders/3');
  pathStructure.includeObservedUrlPath('get', '/orders/3/tracking');
  pathStructure.includeObservedUrlPath('get', '/users/m24-3343/addresses/1');
  pathStructure.includeObservedUrlPath('get', '/users/n94-3343/addresses');
  pathStructure.includeObservedUrlPath('get', '/users/n94-3343/addresses/4');
  pathStructure.includeObservedUrlPath('get', '/health-check');
  pathStructure.includeObservedUrlPath('get', '/rates/10005');

  pathStructure.replaceConstantsWithVariables();

  expect(pathStructure.undocumentedPaths()).toEqual([
    {
      methods: ['get'],
      pathPattern: '/orders/{order}',
      examplePath: '/orders/3',
    },
    {
      methods: ['get'],
      pathPattern: '/orders/{order}/products',
      examplePath: '/orders/3/products',
    },
    {
      methods: ['get'],
      pathPattern: '/orders/{order}/tracking',
      examplePath: '/orders/3/tracking',
    },
    {
      methods: ['get'],
      pathPattern: '/health-check',
      examplePath: '/health-check',
    },
    {
      methods: ['get'],
      pathPattern: '/rates/{rate}',
      examplePath: '/rates/10005',
    },
    {
      methods: ['get'],
      pathPattern: '/users/{user}/addresses',
      examplePath: '/users/m24-3343/addresses',
    },
    {
      methods: ['get'],
      pathPattern: '/users/{user}/addresses/{address}',
      examplePath: '/users/m24-3343/addresses/1',
    },
  ]);
});

it('can infer multiple top level resources under the an API path', () => {
  const pathStructure = new InferPathStructure([
    {
      pathPattern: '/api',
      methods: ['get'],
    },
  ]);

  pathStructure.includeObservedUrlPath('get', '/api/orders/3/products');
  pathStructure.includeObservedUrlPath('get', '/api/orders/3');
  pathStructure.includeObservedUrlPath('get', '/api/orders/3/tracking');
  pathStructure.includeObservedUrlPath(
    'get',
    '/api/users/m24-3343/addresses/1'
  );
  pathStructure.includeObservedUrlPath('get', '/api/users/n94-3343/addresses');
  pathStructure.includeObservedUrlPath(
    'get',
    '/api/users/n94-3343/addresses/4'
  );
  pathStructure.includeObservedUrlPath('get', '/api/health-check');
  pathStructure.includeObservedUrlPath('get', '/api/rates/10005');

  pathStructure.replaceConstantsWithVariables();

  const results = pathStructure.undocumentedPaths();

  expect(results).toEqual([
    {
      methods: ['get'],
      pathPattern: '/api/orders/{order}',
      examplePath: '/api/orders/3',
    },
    {
      methods: ['get'],
      pathPattern: '/api/orders/{order}/products',
      examplePath: '/api/orders/3/products',
    },
    {
      methods: ['get'],
      pathPattern: '/api/orders/{order}/tracking',
      examplePath: '/api/orders/3/tracking',
    },
    {
      methods: ['get'],
      pathPattern: '/api/health-check',
      examplePath: '/api/health-check',
    },
    {
      methods: ['get'],
      pathPattern: '/api/rates/{rate}',
      examplePath: '/api/rates/10005',
    },
    {
      methods: ['get'],
      examplePath: '/api/users/m24-3343/addresses',
      pathPattern: '/api/users/{user}/addresses',
    },
    {
      methods: ['get'],
      pathPattern: '/api/users/{user}/addresses/{address}',
      examplePath: '/api/users/m24-3343/addresses/1',
    },
  ]);
});
