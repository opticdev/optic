import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const responseBodyPropertyRemoving = check(
  'prevent removing properties'
).failingExample(
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
