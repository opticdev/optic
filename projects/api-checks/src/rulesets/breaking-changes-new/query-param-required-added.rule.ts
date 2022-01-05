import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const queryParameterRequiredAdded = check(
  'prevent adding required query parameter'
)
  .implementation(({ request }) => {
    const { expect } = require('chai');
    request.queryParameter.added.must('not be allowed', (param) => {
      if (param.required) {
        expect.fail('expected added query parameter to not be required');
      }
    });
  })
  .passingExample(
    scenario('adding optional').queryParameter.added({
      in: 'query',
      name: 'exampleParam',
      required: false,
    })
  )
  .failingExample(
    scenario('adding required').queryParameter.added({
      in: 'query',
      name: 'exampleParam',
      required: true,
    })
  );
