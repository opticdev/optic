import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

export default check('prevent removing properties')
  .implementation(({ bodyProperties }) => {
    const { expect } = require('chai');
    bodyProperties.removed.must('not be allowed', (property, context) => {
      if (context.isInResponse) {
        expect.fail('expected response property to not be removed');
      }
    });
  })
  .failingExample(
    scenario('removing property').responseBodySchema.changed(
      {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: [],
      },
      (schema) => {
        if (schema.properties) {
          delete schema.properties.name;
        }
        return schema;
      }
    )
  );
