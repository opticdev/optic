import { it, expect } from '@jest/globals';
import {
  computeInferredOperations,
  InferPathStructure,
} from './infer-path-structure';
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
    { methods: ['get', 'post'], pathPattern: '/todos' },
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
    },
    {
      methods: ['get'],
      pathPattern: '/organizations/{organization}/members/{member}',
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
    { methods: ['get'], pathPattern: '/organizations/{organization}' },
    {
      methods: ['get'],
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
    { methods: ['get'], pathPattern: '/users/{username}/events/private' },
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
    { methods: ['get'], pathPattern: '/users/{user}/events' },
    { methods: ['get'], pathPattern: '/users/{user}/repos' },
    { methods: ['get'], pathPattern: '/users/{user}/favorites' },
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
    { methods: ['get'], pathPattern: '/users/{user}/events' },
    { methods: ['get'], pathPattern: '/users/{user}/repos' },
    { methods: ['get'], pathPattern: '/users/{user}/favorites' },
    { methods: ['get'], pathPattern: '/users/{user}/repos/{repo}' },
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
    { methods: ['get'], pathPattern: '/orders/{order}' },
    { methods: ['get'], pathPattern: '/orders/{order}/products' },
    { methods: ['get'], pathPattern: '/orders/{order}/tracking' },
    { methods: ['get'], pathPattern: '/health-check' },
    { methods: ['get'], pathPattern: '/rates/{rate}' },
    { methods: ['get'], pathPattern: '/users/{user}/addresses' },
    {
      methods: ['get'],
      pathPattern: '/users/{user}/addresses/{address}',
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
    { methods: ['get'], pathPattern: '/api/orders/{order}' },
    { methods: ['get'], pathPattern: '/api/orders/{order}/products' },
    { methods: ['get'], pathPattern: '/api/orders/{order}/tracking' },
    { methods: ['get'], pathPattern: '/api/health-check' },
    { methods: ['get'], pathPattern: '/api/rates/{rate}' },
    { methods: ['get'], pathPattern: '/api/users/{user}/addresses' },
    {
      methods: ['get'],
      pathPattern: '/api/users/{user}/addresses/{address}',
    },
  ]);
});

it('works with async captured interactions', async () => {
  const interactions = AT.from([
    simpleInteractionFixture('/orders/3/products', HttpMethods.POST),
    simpleInteractionFixture('/orders/3/products', HttpMethods.PATCH),
    simpleInteractionFixture('/orders', HttpMethods.GET),
  ]);

  const operationsToAdd = await computeInferredOperations(
    {
      openapi: '3.0.3',
      paths: {},
      info: {
        title: 'empty',
        version: '0',
      },
    },
    interactions
  );

  expect(operationsToAdd).toEqual([
    { methods: ['get'], pathPattern: '/orders' },
    {
      methods: ['post', 'patch'],
      pathPattern: '/orders/{order}/products',
    },
  ]);
});

function simpleInteractionFixture(
  path: string,
  method: OpenAPIV3.HttpMethods
): CapturedInteraction {
  return {
    request: {
      host: 'optic.test',
      method,
      path,
      body: null,
    },
    response: {
      statusCode: '200',
      body: null,
    },
  };
}
