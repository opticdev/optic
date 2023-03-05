import { FlatOpenAPIV3, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { computeClosenessCached, walkSchema } from './closeness';
import { SpecPatch, SpecPatches } from '../../specs';
import { PatchImpact } from '../../patches';

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

      let matchedAChild = false;

      for await (let items of arrayItems) {
        const match = this.findClosest(jsonPointerHelpers.get(spec, items));
        if (match && match.percent > this.closeness) {
          matchedAChild = true;
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

      if (!matchedAChild) {
        const rootSchema = this.findClosest(addedSchema);
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
