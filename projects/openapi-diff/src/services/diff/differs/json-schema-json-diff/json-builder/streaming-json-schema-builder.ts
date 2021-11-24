import { JsonSchemaJsonDiffer } from '../types';
import { FieldLocation, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { isObject } from '../../../../../utils/is-object';
import { jsonPatcher } from '../../../../patch/incremental-json-patch/json-patcher';
import invariant from 'ts-invariant';
import equals from 'fast-deep-equal';

export function streamingJsonSchemaBuilder(
  jsonDiffer: JsonSchemaJsonDiffer,
  input: any,
  ...additionalInputs: any[]
): OpenAPIV3.SchemaObject {
  const initialType = chooseInitialType(input);
  let allExamples = [input, ...additionalInputs];
  let lastExample: any | undefined = undefined;

  let schema = initialType;
  let diffs = jsonDiffer.compare(
    initialType,
    allExamples[0],
    inResponseSimulated_forbaseline,
    '',
    { collapseToFirstInstanceOfArrayDiffs: true }
  );

  // keep extending schema until we hit zero diffs
  while (diffs.length > 0 || allExamples.length > 0) {
    const extended = extendSchemaWithExample(
      jsonDiffer,
      schema,
      allExamples[0]
    );

    if (
      !equals(extended.schema, initialType) &&
      !equals(lastExample, allExamples[0])
    ) {
      invariant(
        !equals(extended.schema, schema),
        'patches are not extending the schema as required by the json builder '
      );
    }
    schema = extended.schema;
    diffs = extended.diffs;
    lastExample = allExamples[0];
    if (extended.diffs.length === 0) {
      // once we run out of diffs for an example, remove it, then filter out anything else without diffs
      allExamples.shift();
    }
  }

  return schema;
}

export function extendSchemaWithExample(
  jsonDiffer: JsonSchemaJsonDiffer,
  schema: OpenAPIV3.SchemaObject,
  input: any
) {
  const patchJsonSchema = jsonPatcher(schema);

  const diffs = jsonDiffer.compare(
    schema,
    input,
    inResponseSimulated_forbaseline,
    '',
    { collapseToFirstInstanceOfArrayDiffs: true }
  );

  diffs.forEach((diff) => {
    const patches = jsonDiffer.diffToPatch(diff, patchJsonSchema as any);
    const extendsPatches = patches.filter((i) => i.extends);
    // console.log(extendsPatches);
    extendsPatches.forEach((i) => {
      if (i.patch.length > 0) {
        patchJsonSchema.applyPatch({
          intent: i.effect,
          patches: i.patch.flatMap((i) => i.patches),
        });
      }
    });
  });

  const newSchema = patchJsonSchema.currentDocument();

  return {
    schema: newSchema,
    diffs: jsonDiffer.compare(
      newSchema,
      input,
      inResponseSimulated_forbaseline,
      '',
      { collapseToFirstInstanceOfArrayDiffs: true }
    ),
  };
}

function chooseInitialType(rootInput: any): OpenAPIV3.SchemaObject {
  if (isObject(rootInput)) {
    return { type: 'object' };
  } else if (Array.isArray(rootInput)) {
    return {
      type: 'array',
      items: rootInput.length ? chooseInitialType(rootInput[0]) : {},
    };
  } else if (typeof rootInput === 'string') {
    return { type: 'string' };
  } else if (typeof rootInput === 'number') {
    return { type: 'number' };
  } else if (typeof rootInput === 'boolean') {
    return { type: 'boolean' };
  } else if (rootInput === null) {
    // @ts-ignore, this is ok now.
    return { type: 'null' };
  } else {
    throw new Error('Could not learn JSON Schema');
  }
}

// when extending the spec, follow in response rules
const inResponseSimulated_forbaseline: FieldLocation = {
  path: '/',
  method: 'get',
  inResponse: {
    statusCode: '200',
    body: { contentType: 'application/json' },
  },
  jsonSchemaTrail: [],
};
