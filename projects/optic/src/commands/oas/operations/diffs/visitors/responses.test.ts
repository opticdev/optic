import { it, describe, expect } from '@jest/globals';
import { visitResponses } from './responses';
import { CapturedResponse } from '../../../../capture/sources/captured-interactions';
import { CapturedBody } from '../../../../capture/sources/body';

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
      headers: [],
    };

    const unspecifiedResponse: CapturedResponse = {
      statusCode: '400',
      body: null,
      headers: [],
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
      headers: [],
    };

    const unspecifiedResponse: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.from('test-content', 'text/plain'),
      headers: [],
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
      ...visitResponses(
        { statusCode: '204', body: null, headers: [] },
        responses
      ),
    ];
    expect(matchingResults).toHaveLength(0);

    const unmatchingResults = [
      ...visitResponses(
        { statusCode: '200', body: null, headers: [] },
        responses
      ),
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
      headers: [],
    };

    const parameterMismatch: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.fromJSON({}, 'application/json; charset=utf-8'),
      headers: [],
    };

    const subtypeMisMatch: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.fromJSON({}, 'application/gzip'),
      headers: [],
    };

    const typeMismatch: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.fromJSON({}, 'text/json'),
      headers: [],
    };

    expect([...visitResponses(exactMatch, responses)]).toHaveLength(0);
    expect([...visitResponses(parameterMismatch, responses)]).toHaveLength(0);
    expect([...visitResponses(subtypeMisMatch, responses)]).toHaveLength(0);
    expect([...visitResponses(typeMismatch, responses)]).toHaveLength(0);
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
      headers: [],
    };

    const typeRangeMatch: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.from('a,csv,body', 'text/csv'),
      headers: [],
    };

    const mismatchingType: CapturedResponse = {
      statusCode: '200',
      body: CapturedBody.fromJSON({}, 'application/xml'),
      headers: [],
    };

    expect([...visitResponses(exactMatch, responses)]).toHaveLength(0);
    expect([...visitResponses(typeRangeMatch, responses)]).toHaveLength(0);
    expect([...visitResponses(mismatchingType, responses)]).toHaveLength(0);
  });
});
