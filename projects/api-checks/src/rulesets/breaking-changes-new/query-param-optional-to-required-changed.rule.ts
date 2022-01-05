import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const queryParamOptionalToRequired = check(
  'prevent changing from optional to required'
).failingExample(
  scenario('changing from optional to required').queryParameter.changed(
    {
      in: 'query',
      name: 'exampleParam',
      required: false,
    },
    (param) => {
      param.required = true;
      return param;
    }
  )
);

test(queryParamOptionalToRequired.check.name, async () => {
  expect(await queryParamOptionalToRequired.testExamples()).toMatchSnapshot();
});
