import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const operationRemovalCheck = check('prevent operation removal')
  .description('Removing an operation is a breaking change')
  .failingExample(scenario('removing operation').operation.removed());

test(operationRemovalCheck.check.name, async () => {
  expect(await operationRemovalCheck.testExamples()).toMatchSnapshot();
});
