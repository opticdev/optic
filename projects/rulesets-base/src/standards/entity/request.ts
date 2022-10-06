import { AttributeAssertions } from '../attribute/assertions';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { Matcher } from '../runner/matcher';
import { stat } from 'fs';

export type RequestContext = {
  lifecycle: 'added' | 'removed' | 'continuous';
  operation: {
    pathPattern: string;
    operationLifecycle: 'added' | 'removed' | 'continuous';
    method: OpenAPIV3.HttpMethods;
  };
};

export interface RequestStandard {
  description?: AttributeAssertions<string | undefined, RequestContext>;
  required?: AttributeAssertions<boolean, RequestContext>;
  content?: {
    [contentType: `${string}/${string}`]: {
      schema?: AttributeAssertions<
        OpenAPIV3.SchemaObject | undefined,
        RequestContext
      >;
      example?: AttributeAssertions<
        OpenAPIV3.MediaTypeObject['example'] | undefined,
        RequestContext
      >;
      examples?: AttributeAssertions<
        OpenAPIV3.MediaTypeObject['examples'] | undefined,
        RequestContext
      >;
    };
  };
}

export function Request<OpenAPIType>(
  request:
    | RequestStandard
    | {
        filter: Matcher<OpenAPIType, RequestContext>;
        standard: RequestStandard;
      }
) {
  const standard = 'filter' in request ? request.standard : request;
  const matcher =
    'filter' in request
      ? request.filter
      : { matchesName: 'Applies to All Requests', predicate: () => true };

  return new RequestStandardRunner(standard, matcher);
}

export class RequestStandardRunner<OpenAPIType> {
  constructor(
    private standard: RequestStandard,
    private matches: Matcher<OpenAPIType, RequestContext>
  ) {}
}
