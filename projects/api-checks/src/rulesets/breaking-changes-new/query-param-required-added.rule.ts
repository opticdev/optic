import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const queryParameterRequiredAdded = check(
  'prevent adding required query parameter'
)
  .passingExample(
    scenario('adding optional').queryParameter.added({
      in: 'query',
      name: 'exampleParam',
      required: false,
    })
  )
  .failingExample(
    scenario('adding required').queryParameter.added({
      in: 'query',
      name: 'exampleParam',
      required: true,
    })
  );
