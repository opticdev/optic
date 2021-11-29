import {
  OpenAPIDiffingQuestions,
  openApiDiffingQuestionsTestingStub,
} from '../../../read/types';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { pathMethodOperationDiffer } from './index';

const stub: OpenAPIDiffingQuestions = {
  ...openApiDiffingQuestionsTestingStub,
  operations() {
    return [
      { path: '/example', method: OpenAPIV3.HttpMethods.GET, jsonPath: '' },
      { path: '/', method: OpenAPIV3.HttpMethods.GET, jsonPath: '' },
      { path: '/example', method: OpenAPIV3.HttpMethods.POST, jsonPath: '' },
      {
        path: '/example/{exampleId}',
        method: OpenAPIV3.HttpMethods.PATCH,
        jsonPath: '',
      },
    ];
  },
};

const fixture = pathMethodOperationDiffer(stub);

describe('path method operation differ', () => {
  it('matches a known path, and a known method', () => {
    expect(
      fixture.comparePathAndMethodToOperation(
        {
          path: '/example',
          urlPath: '/example',
          pathParameterValues: {},
        },
        OpenAPIV3.HttpMethods.GET
      )
    ).toMatchSnapshot();
  });
  it('emits a diff when known path has new method', () => {
    expect(
      fixture.comparePathAndMethodToOperation(
        {
          path: '/example',
          urlPath: '/example',
          pathParameterValues: {},
        },
        OpenAPIV3.HttpMethods.PUT
      )
    ).toMatchSnapshot();
  });

  it('does not emit a diff when known path has connection-specific method', () => {
    expect(
      fixture.comparePathAndMethodToOperation(
        {
          path: '/example',
          urlPath: '/example',
          pathParameterValues: {},
        },
        OpenAPIV3.HttpMethods.OPTIONS
      )
    ).toMatchSnapshot();
    expect(
      fixture.comparePathAndMethodToOperation(
        {
          path: '/example',
          urlPath: '/example',
          pathParameterValues: {},
        },
        OpenAPIV3.HttpMethods.TRACE
      )
    ).toMatchSnapshot();
    expect(
      fixture.comparePathAndMethodToOperation(
        {
          path: '/example',
          urlPath: '/example',
          pathParameterValues: {},
        },
        OpenAPIV3.HttpMethods.OPTIONS
      )
    ).toMatchSnapshot();
    expect(
      fixture.comparePathAndMethodToOperation(
        {
          path: '/example',
          urlPath: '/example',
          pathParameterValues: {},
        },
        OpenAPIV3.HttpMethods.HEAD
      )
    ).toMatchSnapshot();
  });
});
