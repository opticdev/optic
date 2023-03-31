import { it, describe, expect } from '@jest/globals';
import { visitRequestBody } from './request-body';
import { Operation, HttpMethods } from '../..';
import { CapturedBody, CapturedRequest } from '../../../captures';

describe('visitRequestBody', () => {
  it('detects an unspecified request body', () => {
    const requestWithoutBody: CapturedRequest = {
      host: 'test',
      path: '/some-path',
      method: HttpMethods.POST,
      body: null,
      headers: [],
      query: [],
    };

    const requestWithBody = {
      ...requestWithoutBody,
      body: CapturedBody.fromJSON({}, 'application/json'),
    };

    const matchingResults = [
      ...visitRequestBody(requestWithoutBody, undefined),
    ];
    expect(matchingResults).toHaveLength(0);

    const unmatchingResults = [...visitRequestBody(requestWithBody, undefined)];
    expect(unmatchingResults).toHaveLength(1);
    expect(unmatchingResults).toMatchSnapshot();
  });

  it('detects missing required request bodies', () => {
    const requestBodySpec = {
      content: {
        'application/json': {},
      },
      required: true,
    };

    const requestWithoutBody: CapturedRequest = {
      host: 'test',
      path: '/some-path',
      method: HttpMethods.POST,
      body: null,
      headers: [],
      query: [],
    };

    const results = [...visitRequestBody(requestWithoutBody, requestBodySpec)];
    expect(results).toHaveLength(1);
    expect(results).toMatchSnapshot();
  });

  it('detects request bodies with an undocumented content type', () => {
    const requestBodySpec = {
      content: {
        'application/json': {},
      },
      required: true,
    };

    const jsonRequest = {
      host: 'test',
      path: '/some-path',
      method: HttpMethods.POST,
      body: CapturedBody.fromJSON({}, 'application/json'),
      headers: [],
      query: [],
    };

    const csvRequest = {
      ...jsonRequest,
      body: CapturedBody.from('item1,item2', 'text/csv'),
      headers: [],
      query: [],
    };

    const missingContentTypeRequest = {
      ...jsonRequest,
      body: CapturedBody.from('test-body'),
      headers: [],
      query: [],
    };

    const jsonResults = [...visitRequestBody(jsonRequest, requestBodySpec)];
    expect(jsonResults).toHaveLength(0);

    const csvResults = [...visitRequestBody(csvRequest, requestBodySpec)];
    expect(csvResults).toHaveLength(1);
    expect(csvResults).toMatchSnapshot();

    const missingContentTypeResults = [
      ...visitRequestBody(missingContentTypeRequest, requestBodySpec),
    ];
    expect(missingContentTypeResults).toHaveLength(1);
    expect(missingContentTypeResults).toMatchSnapshot();
  });

  it('matches request body content type by type and subtype (essence)', () => {
    const requestBodySpec = {
      content: {
        'application/json': {},
      },
      required: true,
    };

    const exactMatch = {
      host: 'test',
      path: '/some-path',
      method: HttpMethods.POST,
      body: CapturedBody.fromJSON({}, 'application/json'),
      headers: [],
      query: [],
    };

    const parameterMismatch = {
      host: 'test',
      path: '/some-path',
      method: HttpMethods.POST,
      body: CapturedBody.fromJSON({}, 'application/json; charset=utf-8'),
      headers: [],
      query: [],
    };

    const subtypeMisMatch = {
      host: 'test',
      path: '/some-path',
      method: HttpMethods.POST,
      body: CapturedBody.fromJSON({}, 'application/gzip'),
      headers: [],
      query: [],
    };

    const typeMismatch = {
      host: 'test',
      path: '/some-path',
      method: HttpMethods.POST,
      body: CapturedBody.fromJSON({}, 'text/json'),
      headers: [],
      query: [],
    };

    expect([...visitRequestBody(exactMatch, requestBodySpec)]).toHaveLength(0);
    expect([
      ...visitRequestBody(parameterMismatch, requestBodySpec),
    ]).toHaveLength(0);
    expect([
      ...visitRequestBody(subtypeMisMatch, requestBodySpec),
    ]).toHaveLength(1);
    expect([...visitRequestBody(typeMismatch, requestBodySpec)]).toHaveLength(
      1
    );
  });

  it('matches request body content type range', () => {
    const requestBodySpec = {
      content: {
        'application/json': {},
        'text/*': {},
        'text/plain': {},
      },
      required: true,
    };

    const exactMatch = {
      host: 'test',
      path: '/some-path',
      method: HttpMethods.POST,
      body: CapturedBody.from('a-plain-text-body', 'text/plain'),
      headers: [],
      query: [],
    };

    const typeRangeMatch = {
      host: 'test',
      path: '/some-path',
      method: HttpMethods.POST,
      body: CapturedBody.from('a,csv,body', 'text/csv'),
      headers: [],
      query: [],
    };

    const mismatchingType = {
      host: 'test',
      path: '/some-path',
      method: HttpMethods.POST,
      body: CapturedBody.fromJSON({}, 'application/xml'),
      headers: [],
      query: [],
    };

    expect([...visitRequestBody(exactMatch, requestBodySpec)]).toHaveLength(0);
    expect([...visitRequestBody(typeRangeMatch, requestBodySpec)]).toHaveLength(
      0
    );
    expect([
      ...visitRequestBody(mismatchingType, requestBodySpec),
    ]).toHaveLength(1);
  });
});
