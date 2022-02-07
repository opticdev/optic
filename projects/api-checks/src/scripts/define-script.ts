import commander from 'commander';
import {
  loadSpecFromFile,
  collectFilePatchesFromInMemoryUpdates,
} from '@useoptic/openapi-io';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

function commandWithName(name: string) {
  return new commander.Command(name).addArgument(
    new commander.Argument('[openapi]', 'path to openapi file')
  );
}

export async function makeOpenApiPatcher(pathToOpenApi: string) {
  const parsedOpenAPI = await loadSpecFromFile(pathToOpenApi, true);
  const virtual = collectFilePatchesFromInMemoryUpdates<OpenAPIV3.Document>({
    jsonLike: parsedOpenAPI.flattened as OpenAPIV3.Document,
    sourcemap: parsedOpenAPI.sourcemap!,
  });

  return virtual;
}

export function script(name: string) {
  return commandWithName(name);
}
