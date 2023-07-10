import { test, expect, describe } from '@jest/globals';

import {
  createRequest,
  createResponse,
  createOperation,
  createSpecification,
} from '../data-constructors';
import { groupFacts } from '../group-facts';
import {
  before,
  after,
  changes,
  beforeOpenApiJson,
  afterOpenApiJson,
} from './examples/petstore-small';

const groupedFacts = groupFacts({
  beforeFacts: before,
  afterFacts: after,
  changes,
});

describe('createSpecification', () => {
  test('specification with before key', () => {
    expect(
      createSpecification(
        groupedFacts.specification,
        'before',
        beforeOpenApiJson
      )
    ).toMatchSnapshot();
  });

  test('specification with after key', () => {
    expect(
      createSpecification(groupedFacts.specification, 'after', afterOpenApiJson)
    ).toMatchSnapshot();
  });

  test('specification with no before key', () => {
    expect(
      createSpecification(
        { ...groupedFacts.specification, before: null },
        'before',
        beforeOpenApiJson
      )
    ).toBe(null);
  });

  test('specification with no after key', () => {
    expect(
      createSpecification(
        { ...groupedFacts.specification, after: null },
        'after',
        afterOpenApiJson
      )
    ).toBe(null);
  });
});

describe('createRequest', () => {
  const requestWithBothKeys = groupedFacts.endpoints.get('put /pet')!.request;
  const contentType = 'application/json';

  test('request with before key', () => {
    expect(
      createRequest(
        requestWithBothKeys,
        contentType,
        'before',
        beforeOpenApiJson
      )
    ).toMatchSnapshot();
  });

  test('request with after key', () => {
    expect(
      createRequest(requestWithBothKeys, contentType, 'after', afterOpenApiJson)
    ).toMatchSnapshot();
  });

  test('request with no before key', () => {
    expect(
      createRequest(
        { ...requestWithBothKeys, before: null },
        contentType,
        'before',
        beforeOpenApiJson
      )
    ).toBe(null);
  });

  test('request with no after key', () => {
    expect(
      createRequest(
        { ...requestWithBothKeys, after: null },
        contentType,
        'after',
        afterOpenApiJson
      )
    ).toBe(null);
  });

  test('request body with no before key', () => {
    expect(
      createRequest(
        requestWithBothKeys,
        'not a content type for this request',
        'before',
        beforeOpenApiJson
      )
    ).toBe(null);
  });

  test('request body with no after key', () => {
    expect(
      createRequest(
        requestWithBothKeys,
        'not a content type for this request',
        'after',
        afterOpenApiJson
      )
    ).toBe(null);
  });
});

describe('createResponse', () => {
  const responseWithBothKeys = groupedFacts.endpoints
    .get('get /pet/findByStatus')!
    .responses.get('200')!;

  test('response with before key', () => {
    expect(
      createResponse(responseWithBothKeys, 'before', beforeOpenApiJson)
    ).toMatchSnapshot();
  });

  test('response with after key', () => {
    expect(
      createResponse(responseWithBothKeys, 'after', afterOpenApiJson)
    ).toMatchSnapshot();
  });

  test('response with no before key', () => {
    expect(
      createResponse(
        { ...responseWithBothKeys, before: null },
        'before',
        beforeOpenApiJson
      )
    ).toBe(null);
  });

  test('response with no after key', () => {
    expect(
      createResponse(
        { ...responseWithBothKeys, after: null },
        'after',
        afterOpenApiJson
      )
    ).toBe(null);
  });
});

describe('createOperation', () => {
  test('with before key', () => {
    const endpoint = groupedFacts.endpoints.get('get /store/order/{orderId}')!;
    expect(
      createOperation(endpoint, 'before', beforeOpenApiJson)
    ).toMatchSnapshot();
  });

  test('with after key', () => {
    const endpoint = groupedFacts.endpoints.get('get /store/order/{orderId}')!;
    expect(
      createOperation(endpoint, 'after', afterOpenApiJson)
    ).toMatchSnapshot();
  });

  test('without before key', () => {
    const endpoint = groupedFacts.endpoints.get('get /pet/findByStatus')!;
    expect(createOperation(endpoint, 'before', beforeOpenApiJson)).toBe(null);
  });

  test('without after key', () => {
    const endpoint = groupedFacts.endpoints.get('get /pet/findByStatus')!;
    expect(
      createOperation({ ...endpoint, after: null }, 'after', afterOpenApiJson)
    ).toBe(null);
  });
});
