import { AllOperations, GetOperations } from './example/shared';
import {
  factsToChangelog,
  OpenAPITraverser,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { RunnerEntityInputs } from '../entity/base';

it('can markdownify all operations', () => {
  const abc = AllOperations.toMarkdown().join('');
  console.log(abc);
});
it('can markdownify post operations', () => {
  const abc = GetOperations.toMarkdown().join('');
  console.log(abc);
});

// it('can run operation rules', () => {
//   const spec: OpenAPIV3.Document = {
//     openapi: '3.0.0',
//     info: {
//       title: '',
//       version: '',
//     },
//     paths: {
//       '/legacy/example': {
//         get: {
//           responses: {},
//         },
//       },
//       '/example': {
//         get: {
//           operationId: 'getExample',
//           responses: {},
//         },
//       },
//     },
//   };
//   const spec1: OpenAPIV3.Document = {
//     openapi: '3.0.0',
//     info: {
//       title: '',
//       version: '',
//     },
//     paths: {
//       '/example': {
//         get: {
//           operationId: 'getExampleSingle',
//           description: '',
//           responses: {},
//         },
//       },
//       '/example/{id}': {
//         get: {
//           operationId: 'getExampleById',
//           description: '',
//           responses: {},
//         },
//       },
//     },
//   };
//   const inputs = prepareInputs(spec, spec1);
//
//   AllOperations.run(inputs);
// });

function prepareInputs(
  beforeSpec: OpenAPIV3.Document,
  afterSpec: OpenAPIV3.Document
): RunnerEntityInputs {
  const beforeT = new OpenAPITraverser();
  const afterT = new OpenAPITraverser();

  beforeT.traverse(beforeSpec);
  afterT.traverse(afterSpec);

  const afterFacts = Array.from(afterT.facts());
  const beforeFacts = Array.from(beforeT.facts());

  return {
    afterFacts,
    beforeFacts,
    beforeSpec,
    changelog: factsToChangelog(beforeFacts, afterFacts),
    afterSpec,
  };
}
