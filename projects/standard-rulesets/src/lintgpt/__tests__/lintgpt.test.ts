// import { expect, jest, test } from '@jest/globals';
// import { LintGpt, LintGptConfig } from '../index';
// import { OpenAPIV3 } from '@useoptic/openapi-utilities';
// import { TestHelpers } from '@useoptic/rulesets-base';
//
// jest.setTimeout(100000);
// test('lintgpt ', async () => {
//   const config: LintGptConfig = {
//     design: {
//       rules: [
//         'All operations must have an operationId',
//         'All operationIDs must be camelCase',
//         'operationId should NEVER change',
//         'The keys in an object property should all follow the same naming convention',
//         'GET operations should use 200 status code for its success response',
//         'All operations must have security defined',
//         'Arrays are not allowed to be the first thing in a response body. They MUST be wrapped like so {"users": []}',
//       ],
//     },
//   };
//   const prepared = await LintGpt.fromOpticConfig(config);
//
//   const beforeJson: OpenAPIV3.Document = {
//     ...TestHelpers.createEmptySpec(),
//     paths: {
//       '/api/users': {
//         get: {
//           operationId: 'getUsers',
//           responses: {
//             '201': {
//               description: 'Response from the API',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'array',
//                     items: {
//                       type: 'object',
//                       properties: {
//                         lastName: { type: 'string' },
//                         ID: { type: 'string' },
//                         first_name: { type: 'string' },
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   };
//   const afterJson: OpenAPIV3.Document = JSON.parse(JSON.stringify(beforeJson));
//   afterJson!.paths!['/api/users']!['get']!.operationId = 'get_all_the_users';
//
//   if (prepared instanceof LintGpt) {
//     const results = await TestHelpers.externalRulesWithInputs(
//       prepared,
//       beforeJson,
//       afterJson
//     );
//     expect(results).toMatchSnapshot();
//   }
// });
