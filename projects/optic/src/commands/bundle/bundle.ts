import { Command, Option } from 'commander';
import { ParseResult, loadSpec } from '../../utils/spec-loaders';
import { OpticCliConfig } from '../../config';
import {
  OpenAPIV3,
  sourcemapReader,
  UserError,
} from '@useoptic/openapi-utilities';
import { isYaml, JsonSchemaSourcemap } from '@useoptic/openapi-io';
import fs from 'node:fs/promises';
import path from 'path';
import yaml from 'yaml';

import { errorHandler } from '../../error-handler';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Operation } from 'fast-json-patch';
import * as jsonpatch from 'fast-json-patch';
import sortby from 'lodash.sortby';
import { logger } from '../../logger';
import { jsonIterator } from './json-iterator';
import $RefParser from '@apidevtools/json-schema-ref-parser';
const description = `bundle external references for an OpenAPI specification`;

const usage = () => `
  optic bundle <file_path>
  optic bundle <file_path> > bundled.yml
  optic bundle <file_path> -o bundled.yml
`;
const helpText = `
Example usage:
  $ optic bundle openapi-spec.yml > bundled.yml
  `;

export const registerBundle = (cli: Command, config: OpticCliConfig) => {
  // TODO remove june 2023
  const filterXExtensions = new Option(
    '--filter-x-extensions [extensions]',
    'extensions to filter when truthy value set'
  ).hideHelp(true);
  const includeXExtensions = new Option(
    '--include-x-extensions [extensions]',
    'extensions to filter when truthy value set'
  ).hideHelp(true);

  cli
    .command('bundle')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description(description)
    .argument('[file_path]', 'openapi file to bundle')
    .option('-o [output]', 'output file name')
    .addOption(filterXExtensions)
    .addOption(includeXExtensions)
    .action(errorHandler(bundleAction(config), { command: 'bundle' }));
};

const getSpec = async (
  file1: string,
  config: OpticCliConfig
): Promise<ParseResult> => {
  try {
    return loadSpec(file1, config, {
      strict: false,
      denormalize: false,
    });
  } catch (e) {
    throw new UserError({
      initialError: e instanceof Error ? e : undefined,
      message: e instanceof Error ? e.message : undefined,
    });
  }
};

type BundleActionOptions = {
  o: string;
  filterXExtensions: string;
  includeXExtensions: string;
};

const bundleAction =
  (config: OpticCliConfig) =>
  async (filePath: string | undefined, options: BundleActionOptions) => {
    const { o, filterXExtensions, includeXExtensions } = options;

    const filterExtensions = (filterXExtensions || '')
      .split(/[ ,]+/)
      .filter((extension) => extension.startsWith('x-'));
    const includeExtensions = (includeXExtensions || '')
      .split(/[ ,]+/)
      .filter((extension) => extension.startsWith('x-'));

    let parsedFile: ParseResult;
    if (filePath) {
      parsedFile = await getSpec(filePath, config);

      let updatedSpec = await bundle(parsedFile.jsonLike, parsedFile.sourcemap);

      if (includeExtensions.length) {
        Object.entries(updatedSpec.paths).forEach(([path, operations]) => {
          Object.entries(operations!).forEach(([key, operation]) => {
            if (!Object.values(OpenAPIV3.HttpMethods).includes(key as any))
              return;
            if (
              operation &&
              !includeExtensions.some((extension) =>
                Boolean(operation[extension])
              )
            ) {
              // @ts-ignore
              delete updatedSpec.paths![path]![key]!;
              const otherKeys = Object.keys(updatedSpec.paths![path] || {});
              if (
                otherKeys.length === 0 ||
                (otherKeys.length === 1 && otherKeys[0] === 'parameters')
              ) {
                delete updatedSpec.paths![path];
              }
            }
          });
        });
      }

      if (filterExtensions.length) {
        Object.entries(updatedSpec.paths).forEach(([path, operations]) => {
          Object.entries(operations!).forEach(([key, operation]) => {
            if (!Object.values(OpenAPIV3.HttpMethods).includes(key as any))
              return;
            // should filter
            if (
              operation &&
              filterExtensions.some((extension) =>
                Boolean(operation[extension])
              )
            ) {
              // @ts-ignore
              delete updatedSpec.paths![path]![key]!;
              const otherKeys = Object.keys(updatedSpec.paths![path] || {});
              if (
                otherKeys.length === 0 ||
                (otherKeys.length === 1 && otherKeys[0] === 'parameters')
              ) {
                delete updatedSpec.paths![path];
              }
            }
          });
        });
      }

      updatedSpec = removeUnusedComponents(updatedSpec);

      const yamlOut = () =>
        yaml.stringify(updatedSpec, {
          defaultStringType: 'QUOTE_DOUBLE',
        });

      if (o) {
        // write to file
        const outputPath = path.resolve(o);
        await fs.writeFile(
          outputPath,
          isYaml(o) ? yamlOut() : JSON.stringify(updatedSpec, null, 2)
        );
        logger.info('wrote bundled spec to ' + path.resolve(o));
      } else {
        // assume pipe >
        if (isYaml(filePath)) {
          console.log(yamlOut());
        } else {
          console.log(JSON.stringify(updatedSpec, null, 2));
        }
      }
    } else {
      logger.error('No specification found');
      process.exitCode = 1;
      return;
    }
  };

const methods = `{${Object.values(OpenAPIV3.HttpMethods).join(',')}}`;
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
  inExistingComponent: ['components', 'schemas', '**'],
  inExistingRequestBody: [
    'components',
    'requestBodies',
    '**',
    'content',
    '**/**',
  ],
  inExistingResponseBody: ['components', 'responses', '**', 'content', '**/**'],
  inRequestBody: ['paths', '**', methods, 'requestBody'],
  inResponseStatusCode: ['paths', '**', methods, 'responses', '**'],
  inOperationParameter: ['paths', '**', methods, 'parameters', '**'],
  inPathParameter: ['paths', '**', 'parameters', '**'],
  inRequestExamples: [
    'paths',
    '**',
    methods,
    'requestBody',
    'content',
    '**/**',
    'examples',
    '**',
  ],
  inResponseExamples: [
    'paths',
    '**',
    methods,
    'responses',
    '**',
    'content',
    '**/**',
    'examples',
    '**',
  ],
  inRequestExample: [
    'paths',
    '**',
    methods,
    'requestBody',
    'content',
    '**/**',
    'example',
  ],
  inResponseExample: [
    'paths',
    '**',
    methods,
    'responses',
    '**',
    'content',
    '**/**',
    'example',
  ],
};
async function bundle(
  spec: OpenAPIV3.Document,
  sourcemap: JsonSchemaSourcemap
) {
  // create empty component objects if they do not exist
  if (!spec.components) spec.components = {};
  if (!spec.components.schemas) spec.components.schemas = {};
  if (!spec.components.parameters) spec.components.parameters = {};
  if (!spec.components.examples) spec.components.examples = {};
  if (!spec.components.requestBodies) spec.components.requestBodies = {};
  if (!spec.components.responses) spec.components.responses = {};

  let updatedSpec = spec;

  // handle schemas
  updatedSpec = await bundleMatchingRefsAsComponents<OpenAPIV3.SchemaObject>(
    updatedSpec,
    sourcemap,
    [
      matches.inRequestSchema,
      matches.inResponseSchema,
      matches.inOperationParameterSchema,
      matches.inExistingComponent,
      matches.inExistingRequestBody,
      matches.inExistingResponseBody,
    ],
    'children',
    jsonPointerHelpers.compile(['components', 'schemas']),
    (schema, filePath, pathInFile) => {
      const inOtherFile = filePath !== sourcemap.rootFilePath;

      const components = jsonPointerHelpers.decode(pathInFile);

      if (inOtherFile && components.length <= 1) {
        return toComponentName(path.parse(filePath).name);
      } else {
        if (schema.title) return toComponentName(schema.title);
        const last = components[components.length - 1];
        return toComponentName(last || 'Schema');
      }
    },
    { rewriteMapping: true }
  );

  // handle parameters
  updatedSpec = await bundleMatchingRefsAsComponents(
    updatedSpec,
    sourcemap,
    [matches.inPathParameter, matches.inOperationParameter],
    'parent',
    jsonPointerHelpers.compile(['components', 'parameters']),
    (parameter) => {
      return (
        toComponentName(
          `${capitalize(parameter.name)}${capitalize(parameter.in)}`
        ) || 'Parameter'
      );
    }
  );

  // handle requestBodies
  updatedSpec = await bundleMatchingRefsAsComponents(
    updatedSpec,
    sourcemap,
    [matches.inRequestBody],
    'parent',
    jsonPointerHelpers.compile(['components', 'requestBodies']),
    (example, filePath, pathInFile) => {
      const inOtherFile = filePath !== sourcemap.rootFilePath;
      const components = jsonPointerHelpers.decode(pathInFile);
      if (inOtherFile && components.length <= 1) {
        return toComponentName(path.parse(filePath).name);
      } else {
        const last = components[components.length - 1];
        return toComponentName(last || 'RequestBody');
      }
    }
  );

  updatedSpec = await bundleMatchingRefsAsComponents(
    updatedSpec,
    sourcemap,
    [matches.inResponseStatusCode],
    'parent',
    jsonPointerHelpers.compile(['components', 'responses']),
    (example, filePath, pathInFile) => {
      const inOtherFile = filePath !== sourcemap.rootFilePath;
      const components = jsonPointerHelpers.decode(pathInFile);
      if (inOtherFile && components.length <= 1) {
        return toComponentName(path.parse(filePath).name);
      } else {
        const last = components[components.length - 1];
        return toComponentName(last || 'ResponseBody');
      }
    }
  );

  // handle examples
  updatedSpec = await bundleMatchingRefsAsComponents(
    updatedSpec,
    sourcemap,
    [
      matches.inRequestExample,
      matches.inRequestExamples,
      matches.inResponseExample,
      matches.inResponseExamples,
    ],
    'parent',
    jsonPointerHelpers.compile(['components', 'examples']),
    (example, filePath, pathInFile) => {
      const inOtherFile = filePath !== sourcemap.rootFilePath;
      const components = jsonPointerHelpers.decode(pathInFile);
      if (inOtherFile && components.length <= 1) {
        return toComponentName(path.parse(filePath).name);
      } else {
        const last = components[components.length - 1];
        return toComponentName(last || 'Example');
      }
    }
  );

  return updatedSpec;
}

// assumes single file OpenAPI spec
function removeUnusedComponents(spec: OpenAPIV3.Document): OpenAPIV3.Document {
  let updatedSpec = spec;
  let removedCount: number | undefined = undefined;

  while (removedCount !== 0) {
    const removals: Operation[] = [];

    const refMap: { [key: string]: string } = {};

    const buildRefMap = (
      spec: any,
      pointer: string = jsonPointerHelpers.compile([])
    ) => {
      if (Array.isArray(spec)) {
        spec.forEach((item, index) =>
          buildRefMap(
            item,
            jsonPointerHelpers.append(pointer, index.toString())
          )
        );
      } else if (typeof spec === 'object' && spec !== null) {
        Object.entries(spec).map(([key, value]) => {
          if (key === '$ref' && typeof value === 'string') {
            const componentPath = value.startsWith('#')
              ? value.substring(1)
              : value;

            // remove circular references from count
            if (
              !jsonPointerHelpers.startsWith(
                pointer,
                jsonPointerHelpers.decode(componentPath)
              )
            ) {
              refMap[pointer] = componentPath;
            }
          } else {
            buildRefMap(value, jsonPointerHelpers.append(pointer, key));
          }
        });
      }
    };

    buildRefMap(updatedSpec);

    const usages = new Set(Object.values(refMap));

    const refMapEntries = Object.entries(refMap);

    const hasPathToOperation = (
      componentPath: string,
      parents: string[] = []
    ) => {
      const usages = refMapEntries.filter(
        ([usage, component]) => component === componentPath
      );

      // used directly in a path
      const usedDirectlyInAnOperation = usages.some(([usage]) => {
        return jsonPointerHelpers.startsWith(usage, ['paths'], { exact: true });
      });

      if (usedDirectlyInAnOperation) return true;

      const parentsUsedInOperation = usages.some(([usage, component]) => {
        if (
          jsonPointerHelpers.startsWith(usage, ['components'], { exact: true })
        ) {
          const parentComponent = jsonPointerHelpers.compile(
            jsonPointerHelpers.decode(usage).slice(0, 3)
          );
          // console.log('checking parent: ' + parentComponent);
          if (parents.includes(parentComponent)) return false;
          return hasPathToOperation(parentComponent, [
            ...parents,
            componentPath,
          ]);
        }
      });

      if (parentsUsedInOperation) return true;

      return false;
    };

    const testComponents = (kind: keyof OpenAPIV3.ComponentsObject) => {
      const components = jsonPointerHelpers.tryGet(
        updatedSpec,
        jsonPointerHelpers.compile(['components', kind])
      );
      const componentNames = Object.keys(
        components.match ? components.value : {}
      );

      componentNames.forEach((name) => {
        const jsonPointer = jsonPointerHelpers.compile([
          'components',
          kind,
          name,
        ]);

        const isUsedInOperation = hasPathToOperation(jsonPointer);

        if (!usages.has(jsonPointer) || !isUsedInOperation) {
          removals.push({ op: 'remove', path: jsonPointer });
        }
      });
    };

    testComponents('schemas');
    testComponents('requestBodies');
    testComponents('responses');
    testComponents('examples');
    testComponents('parameters');
    testComponents('headers');

    const copied = JSON.parse(JSON.stringify(updatedSpec));
    removedCount = removals.length;
    updatedSpec = jsonpatch.applyPatch(
      copied,
      removals,
      true,
      true
    ).newDocument;
  }

  return updatedSpec;
}

async function bundleMatchingRefsAsComponents<T>(
  spec: OpenAPIV3.Document,
  sourcemap: JsonSchemaSourcemap,
  matchers: string[][],
  match: 'parent' | 'children',
  targetPath: string,
  naming: (T, lookup: string, pathInFile: string) => string,
  options: { rewriteMapping: boolean } = { rewriteMapping: false }
) {
  const rootFileIndex = sourcemap.files.find(
    (i) => i.path === sourcemap.rootFilePath
  )!.index;

  // find all $ref usages that match the target pattern ie. in a schema?
  const matchingKeys = Object.keys(sourcemap.refMappings).filter(
    (flatSpecPath) => {
      return matchers.some((matcher) => {
        if (match === 'parent') {
          return jsonPointerHelpers.matches(flatSpecPath, matcher);
        } else {
          return (
            jsonPointerHelpers.startsWith(flatSpecPath, matcher) ||
            jsonPointerHelpers.matches(flatSpecPath, matcher)
          );
        }
      });
    }
  );

  // build a set of used names -- we don't want conflicts since the namespace is the components.{} object
  const existingComponents = jsonPointerHelpers.tryGet(spec, targetPath);
  const usedNames = new Set<string>(
    existingComponents.match
      ? (Object.keys(existingComponents.value) as string[])
      : []
  );

  // when new components are made, ensure the name is unique. If it's not unique try incrementing `_#` until it is.
  const leaseComponentPath = (name: string): string => {
    let componentName = name;
    let trailingNumber = 0;
    while (usedNames.has(componentName)) {
      componentName = name + '_' + trailingNumber;
      trailingNumber++;
    }

    usedNames.add(componentName);
    return jsonPointerHelpers.append(targetPath, componentName);
  };

  const refs: {
    [key: string]: {
      component: any;
      componentPath: string;
      circular: boolean;
      aliases: Set<string>;
      originalPath: string;
      skipAddingToComponents: boolean;
      usages: string[];
    };
  } = {};

  const addComponentOperations: Operation[] = [];
  const updateUsagesOperations: Operation[] = [];

  matchingKeys.forEach((key) => {
    const mapping = sourcemap.refMappings[key];
    const refKey = `${mapping[0].toString()}-${mapping[1]}`;
    // if the $ref has already been named, add a usage
    if (refs.hasOwnProperty(refKey)) {
      const foundRef = refs[refKey];
      // the first entry was circular, replace it
      const component = jsonPointerHelpers.get(spec, key);
      if (foundRef && foundRef.circular && !component.hasOwnProperty('$ref')) {
        foundRef.component = component;
        foundRef.originalPath = key;
        foundRef.circular = false;
      }
      foundRef.usages.push(key);
    } else {
      // if the $ref has never been seen before, add it and compute a free name
      const component = jsonPointerHelpers.get(spec, key);
      const nameOptions = naming(
        component as T,
        sourcemap.files.find((file) => file.index === mapping[0])!.path,
        mapping[1]
      );

      // this checks if the component is already in the root file of the spec
      const isAlreadyInPlace = refKey.startsWith(
        `${rootFileIndex}-${targetPath}`
      );

      const componentPath = isAlreadyInPlace
        ? (() => {
            const [, lastKey] = jsonPointerHelpers.splitParentChild(mapping[1]);
            usedNames.add(lastKey);
            return mapping[1];
          })()
        : leaseComponentPath(nameOptions);

      const aliases = (() => {
        const set = new Set<string>();
        // file ref with root schema
        if (mapping[1] === '/') {
          set.add(sourcemap.files[mapping[0]].path);
          set.add(
            path.relative(
              path.dirname(sourcemap.rootFilePath),
              sourcemap.files[mapping[0]].path
            )
          );
        }

        if (isAlreadyInPlace) set.add(componentPath);
        return set;
      })();

      refs[refKey] = {
        aliases: aliases,
        skipAddingToComponents: isAlreadyInPlace,
        originalPath: key,
        circular: component.hasOwnProperty('$ref'),
        componentPath,
        component,
        usages: [key],
      };
    }
  });

  const refArray = Object.values(refs);

  // second pass: Nested schemas. Patch the new components we've created that rely on other newly created components.
  refArray.forEach((ref) => {
    const nestedRefs = refArray.filter((i) =>
      i.usages.some(
        (i) =>
          jsonPointerHelpers.startsWith(
            i,
            jsonPointerHelpers.decode(ref.originalPath),
            { exact: true }
          ) && i !== ref.originalPath
      )
    );

    const nestedRefUsageUpdates: Operation[] = [];

    nestedRefs.forEach((nestedRef) => {
      nestedRef.usages.forEach((i) => {
        const original = jsonPointerHelpers.decode(ref.originalPath);
        const newRef = jsonPointerHelpers.decode(i);
        if (
          jsonPointerHelpers.startsWith(
            i,
            jsonPointerHelpers.decode(ref.originalPath),
            { exact: true }
          ) &&
          i !== ref.originalPath &&
          newRef.length > original.length
        ) {
          const original = jsonPointerHelpers.decode(ref.originalPath);
          const newRef = jsonPointerHelpers.decode(i);
          const newPath = jsonPointerHelpers.compile(
            newRef.slice(original.length)
          );

          const patch: Operation = {
            op: 'replace',
            path: newPath,
            value: { $ref: '#' + nestedRef.componentPath },
          };

          nestedRefUsageUpdates.push(patch);
        }
      });

      nestedRef.usages = nestedRef.usages.filter(
        (i) =>
          !(
            jsonPointerHelpers.startsWith(
              i,
              jsonPointerHelpers.decode(ref.originalPath),
              { exact: true }
            ) && i !== ref.originalPath
          )
      );
    });

    ref.component = jsonpatch.applyPatch(
      ref.component,
      sortby(
        nestedRefUsageUpdates,
        (i) => -jsonPointerHelpers.decode(i.path).length
      ),
      true,
      true
    ).newDocument;
  });

  // now generate the actual spec patches
  refArray.forEach((ref) => {
    if (!ref.skipAddingToComponents)
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

  // add components first
  let specCopy = JSON.parse(JSON.stringify(spec));

  specCopy = jsonpatch.applyPatch(
    specCopy,
    addComponentOperations,
    true,
    true
  ).newDocument;
  //
  // // then add $refs in reverse depth order (to prevent conflicts).
  specCopy = sortby(
    updateUsagesOperations,
    (op) => jsonPointerHelpers.decode(op.path).length
  ).reduce((specCopy, operation) => {
    const error = jsonpatch.validate([operation], specCopy);
    if (!error) {
      return jsonpatch.applyPatch(specCopy, [operation], true, true)
        .newDocument;
    } else {
      return specCopy;
    }
  }, specCopy);

  if (options.rewriteMapping) {
    let $refs = await $RefParser.resolve(sourcemap.rootFilePath);

    const refKeys = $refs.paths();

    // handle mapping
    const mappingPattern = [
      matches.inRequestSchema,
      matches.inResponseSchema,
      matches.inOperationParameterSchema,
      matches.inExistingComponent,
      matches.inExistingRequestBody,
      matches.inExistingResponseBody,
    ];
    for (const obj of jsonIterator(specCopy)) {
      if (
        mappingPattern.some(
          (pattern) =>
            jsonPointerHelpers.startsWith(obj.pointer, pattern) &&
            jsonPointerHelpers.endsWith(obj.pointer, [
              'discriminator',
              'mapping',
              '**',
            ])
        )
      ) {
        const isRef = refKeys.find((i) => i.endsWith(obj.value));
        if (isRef) {
          const refFound = refArray.find((i) => i.aliases.has(isRef));
          if (refFound) {
            jsonpatch.applyPatch(specCopy, [
              {
                op: 'replace',
                path: obj.pointer,
                value: '#' + refFound.componentPath,
              },
            ]);
          }
        }
      }
    }
  }

  return specCopy;
}

function toComponentName(input: string) {
  return input.replaceAll(/-/g, '_').replaceAll(/[^a-zA-Z0-9_]+/g, '');
}

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}
