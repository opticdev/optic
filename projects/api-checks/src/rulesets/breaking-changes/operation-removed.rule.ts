import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

export default check('prevent operation removal')
  .description('Removing an operation is a breaking change')
  .implementation(({ operations }) => {
    const { expect } = require('chai');
    operations.removed.must('not be allowed', () => {
      expect.fail('expected operation to not be removed');
    });
  })
  .failingExample(
    scenario('removing operation').paths.changed(
      {
        '/example': {
          get: {
            responses: {
              '200': {
                description: '',
              },
            },
          },
        },
      },
      (paths) => {
        delete paths['/example']!.get;
        return paths;
      }
    )
  );
