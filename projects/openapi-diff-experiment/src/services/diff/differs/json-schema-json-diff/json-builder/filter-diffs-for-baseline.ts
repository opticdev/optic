import { OpenAPIV3 } from 'openapi-types';
import { DiffType, ShapeDiffTypes } from '../../../types';
import { JsonSchemaKnownKeyword } from '../plugins/plugin-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { isObject } from '../../../../../utils/is-object';

/*

  This function is responsible for selecting which diffs are valid during baselining / extending.
  - Only add properties or make them optional, never remove them. Principle of increasing surface area
  - Never change a type, make it a one of
  - For oneOfs, choose one branch to apply the patch to so we don't end up with endless nesting
    - If there is no branch that matches, and none that have the same collection type (array, object), make new branch

 */

export function filterDiffsForBaseline(
  schema: OpenAPIV3.SchemaObject,
  diffs: ShapeDiffTypes[],
  example: any
): ShapeDiffTypes[] {
  // by default return all diffs
  let allowedDiffs: ShapeDiffTypes[] = diffs;
  const removeDiff = (diff: ShapeDiffTypes) => {
    allowedDiffs = allowedDiffs.filter((i) => i != diff);
  };

  // choose extending one of branch, filter out remaining branches
  diffs
    .filter(
      (i: ShapeDiffTypes) =>
        i.type === DiffType.BodyUnmatchedType &&
        i.keyword === JsonSchemaKnownKeyword.oneOf
    )
    .map((oneOf) => {
      const relatedDiffs = diffs.filter(
        (i) => i != oneOf && i.propertyPath.startsWith(oneOf.propertyPath)
      );

      const oneOfBranches = jsonPointerHelpers.tryGet(
        schema,
        oneOf.propertyPath
      );

      if (oneOfBranches.match) {
        const branches: OpenAPIV3.SchemaObject[] = oneOfBranches.value;

        const instanceExample = jsonPointerHelpers.get(
          example,
          oneOf.instancePath
        );

        const matchBranch = branches.findIndex((schema, index) =>
          instanceExampleMatchesOneOfBranch(instanceExample, schema)
        );

        if (matchBranch !== -1) {
          // remove related diffs, we've chosen just one branch to match
          relatedDiffs
            .filter(
              (i) =>
                !i.propertyPath.startsWith(
                  jsonPointerHelpers.append(
                    oneOf.propertyPath,
                    matchBranch.toString()
                  )
                )
            )
            .forEach(removeDiff);

          // we're not going to make a new branch because we can make this one compliant
          removeDiff(oneOf);
        } else {
          // remove all related diffs, we're making a new one of branch
          relatedDiffs.forEach(removeDiff);
        }
      }
    });

  return allowedDiffs;
}

function instanceExampleMatchesOneOfBranch(
  example: any,
  schema: OpenAPIV3.SchemaObject
): boolean {
  if (schema.type) {
    if (isObject(example) && schema.type === 'object') return true;
    if (Array.isArray(example) && schema.type === 'array') return true;
    if (typeof example === 'string' && schema.type === 'string') return true;
    if (typeof example === 'boolean' && schema.type === 'boolean') return true;
    // @todo probably need to explore other number types here too
    if (typeof example === 'number' && schema.type === 'number') return true;
  } else return false;
  // just ignore if it's nested polymorphic

  return false;
}
