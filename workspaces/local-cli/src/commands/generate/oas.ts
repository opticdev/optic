import Command, { flags } from '@oclif/command';
import { getPathsRelativeToConfig } from '@useoptic/cli-config';
import { IPathMapping } from '@useoptic/cli-config';
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { fromOptic } from '@useoptic/cli-shared';
import { getSpecEventsFrom } from '@useoptic/cli-config/build/helpers/read-specification-json';
import { InMemoryOpticContextBuilder } from '@useoptic/spectacle/build/in-memory';
import * as OpticEngine from '@useoptic/optic-engine-wasm';
import { generateOpenApi, makeSpectacle } from '@useoptic/spectacle';

export default class GenerateOas extends Command {
  static description = 'export an OpenAPI 3.0.3 spec';

  static flags = {
    json: flags.boolean({}),
    yaml: flags.boolean({}),
  };

  async run() {
    const { flags } = this.parse(GenerateOas);
    await generateOas(
      flags.yaml || (!flags.json && !flags.yaml) /* make this default */,
      flags.json
    );
  }
}

export async function generateOas(
  flagYaml: boolean,
  flagJson: boolean
): Promise<{ json: string | undefined; yaml: string | undefined } | undefined> {
  try {
    const paths = await getPathsRelativeToConfig();
    const { specStorePath } = paths;
    try {
      const events = await getSpecEventsFrom(specStorePath);

      const parsedOas = await generateOpenApiFromEvents(events);

      const outputFiles = await emit(paths, parsedOas, flagYaml, flagJson);
      const filePaths = Object.values(outputFiles);
      console.log(
        '\n' +
          fromOptic(
            `Generated OAS file${filePaths.length > 1 && 's'}` +
              filePaths.join('\n')
          )
      );

      return outputFiles;
    } catch (e) {
      console.error(e);
    }
  } catch (e) {
    console.error(e);
  }
}

export async function emit(
  paths: IPathMapping,
  parsedOas: object,
  flagYaml: boolean,
  flagJson: boolean
): Promise<{ json: string | undefined; yaml: string | undefined }> {
  const shouldOutputYaml = flagYaml;
  const shouldOutputJson = flagJson;

  const outputPath = path.join(paths.basePath, 'generated');

  let yamlPath, jsonPath;

  await fs.ensureDir(outputPath);
  if (shouldOutputYaml) {
    const outputFile = path.join(outputPath, 'openapi.yaml');
    //@ts-ignore
    await fs.writeFile(outputFile, yaml.safeDump(parsedOas, { indent: 1 }));
    yamlPath = outputFile;
  }
  if (shouldOutputJson) {
    const outputFile = path.join(outputPath, 'openapi.json');
    await fs.writeJson(outputFile, parsedOas, { spaces: 2 });
    jsonPath = outputFile;
  }

  return {
    json: jsonPath,
    yaml: yamlPath,
  };
}

async function getStream(stream: any) {
  const chunks: Buffer[] = [];
  for await (let chunk of stream) {
    chunks.push(chunk); // should already be a Buffer
  }
  return Buffer.concat(chunks).toString();
}

async function generateOpenApiFromEvents(events: any) {
  const opticContext = await InMemoryOpticContextBuilder.fromEvents(
    OpticEngine,
    events
  );
  const spectacle = await makeSpectacle(opticContext);
  return await generateOpenApi(spectacle);
}
