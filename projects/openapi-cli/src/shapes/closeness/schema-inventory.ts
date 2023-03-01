import { FlatOpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { computeClosenessCached, walkSchema } from './closeness';

type ClosestMatch =
  | { ref: string; schema: FlatOpenAPIV3.SchemaObject; percent: number }
  | undefined;
export class SchemaInventory {
  constructor(private closeness: number = 0.8) {}

  private schemaMap: Map<string, FlatOpenAPIV3.SchemaObject> = new Map();

  addSchemas(
    rootJsonpath: string,
    schemas: { [key: string]: FlatOpenAPIV3.SchemaObject | undefined }
  ) {
    Object.entries(schemas).forEach(([name, schema]) => {
      if (schema)
        this.schemaMap.set(
          jsonPointerHelpers.append(rootJsonpath, name),
          schema
        );
    });
  }

  findClosest(generatedSchema: FlatOpenAPIV3.SchemaObject): ClosestMatch {
    const thisSchema = walkSchema(generatedSchema);

    let closestMatch: ClosestMatch;
    this.schemaMap.forEach((value, path) => {
      const closeness = computeClosenessCached(thisSchema, value);
      if (closestMatch && closestMatch.percent < closeness)
        closestMatch = { ref: path, percent: closeness, schema: value };
    });

    if (closestMatch && closestMatch.percent >= this.closeness) {
      return closestMatch;
    } else {
      return null;
    }
  }
}
