import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const requestBodyPropertyTypeChanged = check(
  'prevent changing property type'
).failingExample(
  scenario('changing type').requestBodySchema.changed(
    {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: [],
    },
    (schema) => {
      if (schema.properties && !('$ref' in schema.properties.name)) {
        schema.properties.name.type = 'number';
      }
      return schema;
    }
  )
);

test(requestBodyPropertyTypeChanged.check.name, async () => {
  expect(await requestBodyPropertyTypeChanged.testExamples()).toMatchSnapshot();
});
