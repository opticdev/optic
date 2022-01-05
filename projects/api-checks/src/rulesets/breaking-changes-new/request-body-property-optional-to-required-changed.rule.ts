import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const requestBodyPropertyOptionalToRequired = check(
  'prevent changing optional to required'
)
  .passingExample(
    scenario('changing required to optional').requestBodySchema.changed(
      {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      },
      (schema) => {
        schema.required = [];
        return schema;
      }
    )
  )
  .failingExample(
    scenario('changing optional to required').requestBodySchema.changed(
      {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: [],
      },
      (schema) => {
        schema.required = ['name'];
        return schema;
      }
    )
  );

test(requestBodyPropertyOptionalToRequired.check.name, async () => {
  expect(
    await requestBodyPropertyOptionalToRequired.testExamples()
  ).toMatchSnapshot();
});
