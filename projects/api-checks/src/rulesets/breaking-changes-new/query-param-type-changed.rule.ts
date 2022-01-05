import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const queryParamOptionalToRequired = check(
  'prevent changing query type'
).failingExample(
  scenario('changing type').queryParameter.changed(
    {
      in: 'query',
      name: 'exampleParam',
      schema: {
        type: 'string',
      },
    },
    (param) => {
      if (param.schema && 'type' in param.schema) {
        param.schema.type = 'number';
      }
      return param;
    }
  )
);

test(queryParamOptionalToRequired.check.name, async () => {
  expect(await queryParamOptionalToRequired.testExamples()).toMatchSnapshot();
});
