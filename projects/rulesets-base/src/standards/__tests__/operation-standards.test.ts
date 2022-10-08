import {
  AllOperations,
  GetOperations,
  PostOperations,
  x404NotFoundResponse,
} from './example/shared';
import { SchemaV3 } from '../entity/schema';
import { requirement } from '../attribute/assertions';
import { ApiStandard } from '../index';

it('can markdownify all operations', () => {
  const abc = AllOperations.toMarkdown().join('');
  console.log(abc);
});
it('can markdownify get operations', () => {
  const abc = GetOperations.toMarkdown().join('');
  console.log(abc);
});
it('can markdownify post operations', () => {
  const abc = PostOperations.toMarkdown().join('');
  console.log(abc);
});

it('can markdownify schema standard', () => {
  const abc = SchemaV3({
    type: 'number',
    minimum: requirement('number schema must use minimum', () => {}),
    maximum: requirement('number schema must use minimum', () => {}),
  });
  console.log(abc.toMarkdown().join(''));
});

it('can render a lot', () => {
  const compound = ApiStandard('Aidan Standard', [
    x404NotFoundResponse,
    GetOperations,
    PostOperations,
    SchemaV3({
      type: 'number',
      minimum: requirement('number schema must use minimum', () => {}),
      maximum: requirement('number schema must use minimum', () => {}),
    }),
  ]).toMarkdown();

  console.log(compound);
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
//         post: {
//           operationId: 'getExampleById',
//           description: '',
//           responses: {},
//         },
//       },
//     },
//   };
//   const inputs = prepareInputs(spec, spec1);
//
//   GetOperations.run(inputs);
//   AllOperations.run(inputs);
// });
//
// function prepareInputs(
//   beforeSpec: OpenAPIV3.Document,
//   afterSpec: OpenAPIV3.Document
// ): RunnerEntityInputs {
//   const beforeT = new OpenAPITraverser();
//   const afterT = new OpenAPITraverser();
//
//   beforeT.traverse(beforeSpec);
//   afterT.traverse(afterSpec);
//
//   const afterFacts = Array.from(afterT.facts());
//   const beforeFacts = Array.from(beforeT.facts());
//
//   return {
//     afterFacts,
//     beforeFacts,
//     beforeSpec,
//     changelog: factsToChangelog(beforeFacts, afterFacts),
//     afterSpec,
//   };
// }
