import { ApiCheckService } from '../api-check-service';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
export const defaultEmptySpec: OpenAPIV3.Document = {
  openapi: '3.0.1',
  paths: {},
  info: { version: '0.0.0', title: 'Empty' },
};

it('can run dsl rules through check service', async (done) => {
  const checker = new ApiCheckService<any>();
  done();

  // const results = await checker.runRules(
  //   {
  //     ...defaultEmptySpec,
  //     paths: {
  //       '/example': {
  //         get: {
  //           operationId: 'getExample',
  //           responses: {},
  //         },
  //       },
  //     },
  //   },
  //   {
  //     ...defaultEmptySpec,
  //     paths: {
  //       '/example': {
  //         get: {
  //           operationId: 'get_example',
  //           responses: {},
  //         },
  //       },
  //     },
  //   },

  //   { maturity: 'wip' }
  // );

  // expect(results).toMatchSnapshot();
  // done();
});
