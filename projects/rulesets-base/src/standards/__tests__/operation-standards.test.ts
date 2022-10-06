import { AllOperations, GetOperations } from './example/shared';

it('can markdownify all operations', () => {
  const abc = AllOperations.toMarkdown().join('');
  console.log(abc);
});
it('can markdownify post operations', () => {
  const abc = GetOperations.toMarkdown().join('');
  console.log(abc);
});
