import { it, describe, expect } from '@jest/globals';
import { visitResponses } from './responses';
import { CapturedBody, CapturedResponse } from '../../../captures';

describe('visitResponses', () => {
  it('detects an unspecified response', () => {
    const responses = {
      '200': {
        description: 'success',
      },
    };

    const specifiedResponse: CapturedResponse = {
      statusCode: '200',
      body: null,
    };

    const unspecifiedResponse: CapturedResponse = {
      statusCode: '400',
      body: null,
    };

    const matchingResults = [...visitResponses(specifiedResponse, responses)];
    expect(matchingResults).toHaveLength(0);

    const unmatchingResults = [
      ...visitResponses(unspecifiedResponse, responses),
    ];
    expect(unmatchingResults).toHaveLength(1);
    expect(unmatchingResults).toMatchSnapshot();
  });

  it('detects an unspecified response body', () => {
    const responses = {
      '200': {
        description: 'success',
        content: {
          'application/json': {},
        },
      },
    };

    const specifiedResponse: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.fromJSON({}, 'application/json'),
    };

    const unspecifiedResponse: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.from('test-content', 'text/plain'),
    };

    const matchingResults = [...visitResponses(specifiedResponse, responses)];
    expect(matchingResults).toHaveLength(0);

    const unmatchingResults = [
      ...visitResponses(unspecifiedResponse, responses),
    ];
    expect(unmatchingResults).toHaveLength(1);
    expect(unmatchingResults).toMatchSnapshot();
  });

  it('detects a missing response body', () => {
    const responses = {
      '200': {
        description: 'success',
        content: {
          'application/json': {},
        },
      },
      '204': {
        description: 'successful creation',
      },
    };

    const matchingResults = [
      ...visitResponses({ statusCode: '204', body: null }, responses),
    ];
    expect(matchingResults).toHaveLength(0);

    const unmatchingResults = [
      ...visitResponses({ statusCode: '200', body: null }, responses),
    ];
    expect(unmatchingResults).toHaveLength(1);
    expect(unmatchingResults).toMatchSnapshot();
  });

  it('matches response bodies content types by type and subtype (essence)', () => {
    const responses = {
      '200': {
        description: 'success',
        content: {
          'application/json': {},
        },
      },
    };

    const exactMatch: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.fromJSON({}, 'application/json'),
    };

    const parameterMismatch: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.fromJSON({}, 'application/json; charset=utf-8'),
    };

    const subtypeMisMatch: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.fromJSON({}, 'application/gzip'),
    };

    const typeMismatch: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.fromJSON({}, 'text/json'),
    };

    expect([...visitResponses(exactMatch, responses)]).toHaveLength(0);
    expect([...visitResponses(parameterMismatch, responses)]).toHaveLength(0);
    expect([...visitResponses(subtypeMisMatch, responses)]).toHaveLength(1);
    expect([...visitResponses(typeMismatch, responses)]).toHaveLength(1);
  });

  it('matches response bodies content type ranges', () => {
    const responses = {
      '200': {
        description: 'success',
        content: {
          'application/json': {},
          'text/*': {},
          'text/plain': {},
        },
      },
    };

    const exactMatch: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.from('a-plain-text-body', 'text/plain'),
    };

    const typeRangeMatch: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.from('a,csv,body', 'text/csv'),
    };

    const mismatchingType: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.fromJSON({}, 'application/xml'),
    };

    expect([...visitResponses(exactMatch, responses)]).toHaveLength(0);
    expect([...visitResponses(typeRangeMatch, responses)]).toHaveLength(0);
    expect([...visitResponses(mismatchingType, responses)]).toHaveLength(1);
  });
});
