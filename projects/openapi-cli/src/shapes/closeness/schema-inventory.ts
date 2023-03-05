import { FlatOpenAPIV3, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { computeClosenessCached, walkSchema } from './closeness';
import { SpecPatch, SpecPatches } from '../../specs';
import { PatchImpact } from '../../patches';
import { PathComponents } from '../../operations';
import { Operation } from 'fast-json-patch';

type ClosestMatch = { ref: string; percent: number } | undefined;
export class SchemaInventory {
  constructor(private closeness: number = 0.8) {}

  private schemaMap: Map<string, [string, any][]> = new Map();

  addSchemas(
    rootJsonpath: string,
    schemas: { [key: string]: FlatOpenAPIV3.SchemaObject | undefined }
  ) {
    Object.entries(schemas).forEach(([name, schema]) => {
      if (schema)
        this.schemaMap.set(
          jsonPointerHelpers.append(rootJsonpath, name),
          walkSchema(schema)
        );
    });
  }

  findClosest(generatedSchema: FlatOpenAPIV3.SchemaObject): ClosestMatch {
    const thisSchema = walkSchema(generatedSchema);

    let closestMatch: ClosestMatch;
    this.schemaMap.forEach((value, path) => {
      const closeness = computeClosenessCached(thisSchema, value);
      // existing match
      if (closestMatch && closeness >= closestMatch.percent) {
        closestMatch = { ref: path, percent: closeness };
      }
      // no match
      if (closeness >= this.closeness) {
        closestMatch = { ref: path, percent: closeness };
      }
    });

    if (closestMatch && closestMatch.percent >= this.closeness) {
      return closestMatch;
    } else {
      return undefined;
    }
  }

  async *refsForAdditions(
    addedPaths: Set<string>,
    spec: OpenAPIV3.Document
  ): SpecPatches {
    if (addedPaths.size === 0) return [];
    const sorted = Array.from(addedPaths).sort();

    for await (let added of sorted) {
      const addedSchema = jsonPointerHelpers.get(spec, added);
      const arrayItems = arrayItemPaths(addedSchema, added);

      const isARootSchema =
        jsonPointerHelpers.matches(added, [
          'paths',
          '**',
          '**',
          'responses',
          '**',
          'content',
          '**',
          'schema',
        ]) ||
        // is a root request schema
        jsonPointerHelpers.matches(added, [
          'paths',
          '**',
          '**',
          'requestBody',
          'content',
          '**',
          'schema',
        ]);
      let matchedRoot = false;
      let matchedSub = false;

      if (isARootSchema) {
        const match = this.findClosest(addedSchema);
        // use ref
        if (match) {
          matchedRoot = true;
          const patch: SpecPatch = {
            description: `use $ref ${match.ref}`,
            path: added,
            impact: [PatchImpact.Refactor],
            diff: undefined,
            groupedOperations: [
              {
                intent: `use ref at ${added}`,
                operations: [
                  {
                    op: 'replace',
                    path: added,
                    value: {
                      $ref: `#${match.ref}`,
                    },
                  },
                ],
              },
            ],
          };
          yield patch;
        }
      }

      if (!matchedRoot) {
        for await (let items of arrayItems) {
          const match = this.findClosest(jsonPointerHelpers.get(spec, items));
          if (match && match.percent > this.closeness) {
            matchedSub = true;
            const patch: SpecPatch = {
              description: `use $ref ${match.ref}`,
              path: items,
              impact: [PatchImpact.Refactor],
              diff: undefined,
              groupedOperations: [
                {
                  intent: `use ref at ${items}`,
                  operations: [
                    {
                      op: 'replace',
                      path: items,
                      value: {
                        $ref: `#${match.ref}`,
                      },
                    },
                  ],
                },
              ],
            };
            yield patch;
          }
        }
      }
      //create a root schema
      if (!matchedSub && !matchedRoot && isARootSchema) {
        const refName = refNameGenerator(added);
        matchedRoot = true;
        const refPath = jsonPointerHelpers.compile([
          'components',
          'schemas',
          refName,
        ]);
        const patch: SpecPatch = {
          description: `create and use $ref for body`,
          path: added,
          impact: [PatchImpact.Refactor],
          diff: undefined,
          groupedOperations: [
            {
              intent: 'add components.schemas if needed',
              operations: (() => {
                const ops: Operation[] = [];
                if (!spec.components) {
                  ops.push({
                    op: 'add',
                    path: jsonPointerHelpers.compile(['components']),
                    value: {
                      schemas: {},
                    },
                  });
                } else if (!spec.components.schemas) {
                  ops.push({
                    op: 'add',
                    path: jsonPointerHelpers.compile(['components', 'schemas']),
                    value: {},
                  });
                }
                return ops;
              })(),
            },
            {
              intent: `create ref at ${refPath}`,
              operations: [
                {
                  op: 'add',
                  path: refPath,
                  value: addedSchema,
                },
              ],
            },
            {
              intent: 'use new $ref',
              operations: [
                {
                  op: 'replace',
                  path: added,
                  value: {
                    $ref: `#${refPath}`,
                  },
                },
              ],
            },
          ],
        };
        yield patch;
      }
    }
  }
}

function arrayItemPaths(
  initialSchema: FlatOpenAPIV3.SchemaObject,
  initialPath: string
): string[] {
  const results: string[] = [];

  function walk(schema: FlatOpenAPIV3.SchemaObject, path: string) {
    if (schema.type === 'array' && schema.items) {
      const itemsPath = jsonPointerHelpers.append(initialPath, 'items');
      results.push(itemsPath);
      walk(schema.items, itemsPath);
    } else if (schema.type === 'object' && schema.properties) {
      Object.entries(schema.properties).forEach(([prop, propSchema]) => {
        walk(
          propSchema,
          jsonPointerHelpers.append(initialPath, 'properties', prop)
        );
      });
    }
  }

  walk(initialSchema, initialPath);

  return results;
}

function refNameGenerator(rootBodySchemaPath: string) {
  const [_, path, method, requestBodyOrResponses, ...other] =
    jsonPointerHelpers.decode(rootBodySchemaPath);

  const components = PathComponents.fromPath(path);
  const pathName = components
    .filter((i) => i.kind === 'literal')
    .map((i) => capitalizeFirstLetter(i.name))
    .join('');

  if (requestBodyOrResponses === 'responses') {
    const statusCode = other[0];

    return `${capitalizeFirstLetter(
      method
    )}${pathName}${statusCode.toString()}ResponseBody`;
  } else if (requestBodyOrResponses === 'requestBody') {
    return `${capitalizeFirstLetter(method)}${pathName}RequestBody`;
  } else {
    return 'SharedComponent_' + String(Math.floor(Math.random() * 100));
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
