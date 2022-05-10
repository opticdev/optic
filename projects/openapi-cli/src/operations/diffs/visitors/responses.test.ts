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
});
