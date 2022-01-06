import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const queryParamChangeType = check('prevent changing query type')
  .implementation(({ request }) => {
    request.queryParameter.changed.must(
      'not change the type',
      (beforeParam, afterParam) => {
        const { expect } = require('chai');
        // TODO: this has some possible false positives as something could change from having a type
        //  to being a oneOf, anyOf, or allOf
        if (
          beforeParam.schema &&
          'type' in beforeParam.schema &&
          afterParam.schema &&
          'type' in afterParam.schema &&
          beforeParam.schema.type !== afterParam.schema.type
        ) {
          expect.fail('expected query parameter to not change type');
        }
      }
    );
  })
  .failingExample(
    scenario('changing type').requestParameter.changed(
      {
        in: 'query',
        name: 'exampleParam',
        schema: {
          type: 'string',
        },
      },
      (param) => {
        if (param.schema && 'type' in param.schema) {
          param.schema.type = 'number';
        }
        return param;
      }
    )
  );
