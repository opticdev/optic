import { check } from '../define-check';
import { scenario } from '../scenarios';

const operationRemovalCheck = check('prevent operation removal')
  .description('this is a breaking change')
  .implementation(({ operations }) => {
    operations.removed.must('not be removed unless marked deprecated', () => {
      // expect.fail('operations can not be removed');
    });
  })
  .passingExample(
    scenario('updating description for GET /example').operation.changed(
      {
        operationId: '123',
        responses: {
          200: {
            description: 'abc',
          },
        },
      },
      (original) => {
        original.description = 'CHANGED IT';
        return original;
      }
    )
  )
  .failingExample(
    scenario('removing').operation.removed({
      responses: {},
    })
  )
  .failingExample(
    scenario('adding a field to a response schema').responseSchema.changed(
      {
        type: 'object',
        properties: {},
      },
      {
        type: 'object',
        required: ['hasMe'],
        properties: {
          hasMe: { type: 'string' },
        },
      }
    )
  );
//
// if (typeof jest !== 'undefined') {
test(operationRemovalCheck.check.name, async () => {
  expect(await operationRemovalCheck.testExamples()).toMatchSnapshot();
});
// }
