import { makeOpenApiPatcher, script } from '../define-script';
import commander from 'commander';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export default script('add-operation')
  .addArgument(
    new commander.Argument('[method]').choices([
      'get',
      'post',
      'patch',
      'put',
      'delete',
    ])
  )
  .addArgument(new commander.Argument('[path]'))
  .action(async (openapiPath: string, method: string, path: string) => {
    const patcher = await makeOpenApiPatcher(openapiPath);

    await patcher.update((input, deps) => {
      if (!input.paths[path]) input.paths[path] = {};
      const pathInSpec = input.paths[path]!;

      if (pathInSpec[method as OpenAPIV3.HttpMethods]) {
        console.log('already found in spec.');
      } else {
        pathInSpec[method as OpenAPIV3.HttpMethods] = {
          operationId: 'name_me',
          responses: {
            '200': {
              description: 'success',
            },
          },
        };
      }
    });

    await patcher.flush();
  });
