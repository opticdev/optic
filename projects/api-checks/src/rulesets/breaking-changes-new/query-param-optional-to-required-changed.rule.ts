import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const queryParamOptionalToRequired = check(
  'prevent changing from optional to required'
)
  .implementation(({ request }) => {
    const { expect } = require('chai');
    request.queryParameter.changed.must(
      'not allow changing from optional to required',
      (beforeParam, afterParam) => {
        if (!beforeParam.required && afterParam.required) {
          expect.fail('expected query parameter to be not be required');
        }
      }
    );
  })
  .failingExample(
    scenario('changing from optional to required').requestParameter.changed(
      {
        in: 'query',
        name: 'exampleParam',
        required: false,
      },
      (param) => {
        param.required = true;
        return param;
      }
    )
  );
