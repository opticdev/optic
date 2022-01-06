import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const statusCodeRemoved = check('prevent removing status code')
  .implementation(({ responses }) => {
    const { expect } = require('chai');
    responses.removed.must('not be allowed', (response) => {
      expect.fail('expected response to not be removed');
    });
  })
  .failingExample(
    scenario('removing status code').operation.changed(
      {
        responses: {
          '200': {
            description: '',
          },
        },
      },
      (operation) => {
        delete operation.responses['200'];
        return operation;
      }
    )
  );
