import { Command } from 'commander';
import { ParseResult, getFileFromFsOrGit } from '../../utils/spec-loaders';
import { OpticCliConfig } from '../../config';
import {
  FlatOpenAPIV3,
  OpenAPIV3,
  UserError,
} from '@useoptic/openapi-utilities';
import { isYaml, JsonSchemaSourcemap, writeYaml } from '@useoptic/openapi-io';
import fs from 'node:fs/promises';
import path from 'path';

import { errorHandler } from '../../error-handler';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import slugify from 'slugify';
import { Operation } from 'fast-json-patch';
import * as jsonpatch from 'fast-json-patch';
import sortby from 'lodash.sortby';
const description = `dereference an OpenAPI specification`;

const usage = () => `
  optic bundle <file_path>
  optic bundle <file_path> > dereference.yml
`;
const helpText = `
Example usage:
  $ optic bundle openapi-spec.yml > bundled.yml
  `;

export const registerBundle = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('bundle')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description(description)
    .argument('[file_path]', 'openapi file to bundle')
    .option('-o [output]', 'output file name')
    .action(errorHandler(bundleAction(config)));
};

const getSpec = async (
  file1: string,
  config: OpticCliConfig
): Promise<ParseResult> => {
  try {
    // TODO update function to try download from spec-id cloud
    return getFileFromFsOrGit(file1, config, {
      strict: false,
      denormalize: false,
    });
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    throw new UserError();
  }
};

const bundleAction =
  (config: OpticCliConfig) => async (filePath: string | undefined, options) => {
    const { o } = options;

    let parsedFile: ParseResult;
    if (filePath) {
      parsedFile = await getSpec(filePath, config);

      bundle(parsedFile.jsonLike, parsedFile.sourcemap);

      // if (o) {
      //   // write to file
      //   const outputPath = path.resolve(o);
      //   await fs.writeFile(
      //     outputPath,
      //     isYaml(o) ? writeYaml(specJson) : JSON.stringify(specJson, null, 2)
      //   );
      //   console.log('wrote bundled spec to ' + path.resolve(o));
      // } else {
      //   // assume pipe >
      //   if (isYaml(filePath)) {
      //     console.log(writeYaml(specJson));
      //   } else {
      //     console.log(JSON.stringify(specJson, null, 2));
      //   }
      // }
    } else {
      console.error('No specification found');
      process.exitCode = 1;
      return;
    }
  };

const methods = `{get,post,put,delete,patch,head,options}`;
const matches = {
  inResponseSchema: [
    'paths',
    '**',
    methods,
    'responses',
    '**',
    'content',
    '**/**',
    'schema',
  ],
  inRequestSchema: [
    'paths',
    '**',
    methods,
    'requestBody',
    'content',
    '**/**',
    'schema',
  ],
  inOperationParameterSchema: [
    'paths',
    '**',
    methods,
    'parameters',
    '**',
    'schema',
  ],
  inOperationParameter: ['paths', '**', methods, 'parameters', '**'],
  inPathParametersSchema: ['paths', '**', 'parameters', '**', 'schema'],
  inPathParameter: ['paths', '**', 'parameters', '**'],
};
function bundle(spec: OpenAPIV3.Document, sourcemap: JsonSchemaSourcemap) {
  // ensure component paths you're using first
  bundleMatchingRefsAsComponents(
    spec,
    sourcemap,
    [matches.inRequestSchema, matches.inResponseSchema],
    jsonPointerHelpers.compile(['components', 'schemas'])
  );
}

function bundleMatchingRefsAsComponents(
  spec: OpenAPIV3.Document,
  sourcemap: JsonSchemaSourcemap,
  matchers: string[][],
  targetPath: string
) {
  const matchingKeys = Object.keys(sourcemap.refMappings).filter(
    (flatSpecPath) => {
      return matchers.some((matcher) => {
        return (
          jsonPointerHelpers.startsWith(flatSpecPath, matcher) ||
          jsonPointerHelpers.matches(flatSpecPath, matcher)
        );
      });
    }
  );

  const existingComponents = jsonPointerHelpers.tryGet(spec, targetPath);

  const usedNames = new Set<string>(
    existingComponents.match
      ? (Object.keys(existingComponents.value) as string[])
      : []
  );
  const leaseComponentPath = (name: string): string => {
    let componentName = name;
    while (usedNames.has(componentName)) {
      componentName = name + '_' + String(Math.floor(Math.random() * 100000));
    }

    usedNames.add(componentName);
    return jsonPointerHelpers.append(targetPath, componentName);
  };

  const refs: {
    [key: string]: {
      component: any;
      componentPath: string;
      originalPath: string;
      usages: string[];
    };
  } = {};

  const addComponentOperations: Operation[] = [];
  const updateUsagesOperations: Operation[] = [];

  matchingKeys.forEach((key) => {
    const mapping = sourcemap.refMappings[key];
    const refKey = `${mapping[0].toString()}-${mapping[1]}`;
    if (refs.hasOwnProperty(refKey)) {
      const foundRef = refs[refKey];
      foundRef.usages.push(key);
    } else {
      /// we need a special case for Refs that are already is this SLOT...
      const component = jsonPointerHelpers.get(spec, key);
      const decodedKey = jsonPointerHelpers.decode(key);
      const nameOptions =
        component.title ||
        slugify(decodedKey.join(' '), { replacement: '_', lower: true }) ||
        decodedKey[decodedKey.length - 1];

      refs[refKey] = {
        originalPath: key,
        componentPath: leaseComponentPath(nameOptions),
        component,
        usages: [key],
      };
    }
  });

  const refArray = Object.values(refs);

  refArray.forEach((ref) => {
    const nestedRefs = refArray.filter((i) =>
      i.usages.some((i) => i.startsWith(ref.originalPath))
    );

    const nestedRefUsageUpdates: Operation[] = [];
    nestedRefs.forEach((nestedRef) => {
      nestedRef.usages
        .filter((i) => i.startsWith(ref.originalPath) && i !== ref.originalPath)
        .map((i) => i.split(ref.originalPath)[1])
        .forEach((i) => {
          nestedRefUsageUpdates.push({
            op: 'replace',
            path: i,
            value: { $ref: '#' + nestedRef.componentPath },
          });
        });

      nestedRef.usages = nestedRef.usages.filter(
        (i) => !(i.startsWith(ref.originalPath) && i !== ref.originalPath)
      );
    });
    const copy = JSON.parse(JSON.stringify(ref.component));
    jsonpatch.applyPatch(copy, nestedRefUsageUpdates, true);
    ref.component = copy;
  });

  // to patches
  refArray.forEach((ref) => {
    addComponentOperations.push({
      op: 'add',
      path: ref.componentPath,
      value: ref.component,
    });
    ref.usages.forEach((usage) => {
      updateUsagesOperations.push({
        op: 'replace',
        path: usage,
        value: {
          $ref: '#' + ref.componentPath,
        },
      });
    });
  });

  let specCopy = JSON.parse(JSON.stringify(spec));
  jsonpatch.applyPatch(specCopy, addComponentOperations, true);

  const sortedUpdateOperations = sortby(
    updateUsagesOperations,
    (op) => jsonPointerHelpers.decode(op.path).length
  );

  jsonpatch.applyPatch(specCopy, sortedUpdateOperations, true);

  return specCopy;
}
