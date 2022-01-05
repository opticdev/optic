import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const responseBodyPropertyTypeChanged = check(
  'prevent changing property type'
).failingExample(
  scenario('changing type').responseBodySchema.changed(
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

test(responseBodyPropertyTypeChanged.check.name, async () => {
  expect(
    await responseBodyPropertyTypeChanged.testExamples()
  ).toMatchSnapshot();
});
