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
    };

    const requestWithBody = {
      ...requestWithoutBody,
      body: CapturedBody.fromJSON({}, 'application/json'),
    };

    const matchingResults = [...visitRequestBody(requestWithoutBody, null)];
    expect(matchingResults).toHaveLength(0);

    const unmatchingResults = [...visitRequestBody(requestWithBody, null)];
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
    };

    const csvRequest = {
      ...jsonRequest,
      body: CapturedBody.from('item1,item2', 'text/csv'),
    };

    const missingContentTypeRequest = {
      ...jsonRequest,
      body: CapturedBody.from('test-body'),
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
});
