import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

export default check('prevent adding required query parameter')
  .implementation(({ request }) => {
    const { expect } = require('chai');
    request.queryParameter.added.must('not be allowed', (param, context) => {
      if (context.operationAdded) return; // rule doesn't apply for new operations
      if (param.required) {
        expect.fail('expected added query parameter to not be required');
      }
    });
  })
  .passingExample(
    scenario('adding optional').requestParameter.added({
      in: 'query',
      name: 'exampleParam',
      required: false,
    })
  )
  .failingExample(
    scenario('adding required').requestParameter.added({
      in: 'query',
      name: 'exampleParam',
      required: true,
    })
  );
