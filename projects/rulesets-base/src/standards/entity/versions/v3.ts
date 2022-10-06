import { Operation, OperationContext, OperationStandard } from '../operation';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { Parameter, ParameterContext, ParameterStandard } from '../parameter';
import { Matcher, matches } from '../../runner/matcher';
import { Response, ResponseContext, ResponseStandard } from '../response';
import { changed, requirement } from '../../attribute/assertions';

export const Standard = {
  Operation: (
    operation:
      | OperationStandard
      | {
          filter: Matcher<OpenAPIV3.OperationObject, OperationContext>;
          standard: OperationStandard;
        }
  ) => Operation<OpenAPIV3.OperationObject>(operation),
  Parameter: (
    parameter:
      | ParameterStandard
      | {
          filter: Matcher<OpenAPIV3.ParameterObject, ParameterContext>;
          standard: ParameterStandard;
        }
  ) => Parameter<OpenAPIV3.ParameterObject>(parameter),
  Response: (
    statusCode: string,
    response:
      | ResponseStandard
      | {
          filter: Matcher<OpenAPIV3.ResponseObject, ResponseContext>;
          standard: ResponseStandard;
        }
  ) => Response<OpenAPIV3.ResponseObject>(statusCode, response),
};

Standard.Operation({
  operationId: [
    requirement('must have a description', (desc) => {}),
    changed('abc', (before, after, context) => {}),
  ],
  responses: [
    Response('200', {
      content: {
        'application/json': {},
      },
    }),
  ],
});
