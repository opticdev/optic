import { ApiChangeDsl, OpenAPIV3 } from '@useoptic/api-checks';
import { expect } from 'chai';

export const rules = {
  removingOperationId: ({ operations }: ApiChangeDsl) => {
    operations.changed.must(
      'have consistent operation IDs',
      (current, next) => {
        expect(current.operationId).to.equal(next.operationId);
      }
    );
  },
  preventRemovingOperation: ({ operations }: ApiChangeDsl) => {
    operations.removed.must('not be allowed', (operation, context) => {
      expect.fail('expected operation to be present');
    });
  },
  preventAddingRequiredQueryParameters: ({ request }: ApiChangeDsl) => {
    request.queryParameter.added.must('not be required', (queryParameter) => {
      expect(queryParameter.required).to.not.be.true;
    });
  },
  preventChangingOptionalToRequiredQueryParameters: ({
    request,
  }: ApiChangeDsl) => {
    request.queryParameter.changed.must(
      'not be optional then required',
      (queryParameterBefore, queryParameterAfter) => {
        if (!queryParameterBefore.required) {
          expect(queryParameterAfter.required).to.not.be.true;
        }
      }
    );
  },
  preventRemovingStatusCodes: ({ responses }: ApiChangeDsl) => {
    responses.removed.must('not be removed', (response) => {
      expect(false, `expected ${response.statusCode} to be present`).to.be.true;
    });
  },
  preventChangingParameterDefaultValue: ({ request }: ApiChangeDsl) => {
    request.queryParameter.changed.must(
      'not change the default value',
      (parameterBefore, parameterAfter) => {
        let beforeSchema = (parameterBefore.schema ||
          {}) as OpenAPIV3.SchemaObject;
        let afterSchema = (parameterAfter.schema ||
          {}) as OpenAPIV3.SchemaObject;
        expect(beforeSchema.default).to.equal(afterSchema.default);
      }
    );
  },
};
