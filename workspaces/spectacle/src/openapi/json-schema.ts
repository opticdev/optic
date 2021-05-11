export async function jsonSchemaFromShapeId(
  spectacle: any,
  shapeId: string
): Promise<JsonSchema> {
  const shape = await queryForShape(spectacle, shapeId);

  // We ignore Undefined here because we check in when dealing with Object
  const shapeChoices = shape.data.shapeChoices.filter(
    (shapeChoice: any) => shapeChoice.jsonType !== 'Undefined'
  );

  const results: JsonSchema[] = await Promise.all(
    shapeChoices.map(async (shapeChoice: any) => {
      return await jsonSchemaFromShapeChoice(spectacle, shapeChoice);
    })
  );

  if (results.length === 1) return results[0];

  // In some cases, it might be nicer to do { type: [string, number] }, but this
  // isn't supported in OpenAPI. Leaving it as oneOf for now.
  return { oneOf: results };
}

export async function jsonSchemaFromShapeChoice(
  spectacle: any,
  shapeChoice: any
): Promise<JsonSchema> {
  if (shapeChoice.jsonType === 'Object') {
    const result: JsonSchemaObject = {
      type: 'object',
      properties: {},
      required: [],
    };

    for (const field of shapeChoice.asObject.fields) {
      result.properties[field.name] = (await jsonSchemaFromShapeId(
        spectacle,
        field.shapeId
      )) as any;

      let isRequired = true;

      // We look down into the field shape choices to see if Undefined shows up
      // anywhere. If we find one, we don't mark the field as required.
      const fieldShape = await queryForShape(spectacle, field.shapeId);
      for (const shapeChoice of (fieldShape as any).data.shapeChoices) {
        if (shapeChoice.jsonType === 'Undefined') {
          isRequired = false;
          break;
        }
      }

      if (isRequired) result.required?.push(field.name);
    }

    if (!result.required?.length) delete result.required;

    return result;
  }

  if (shapeChoice.jsonType === 'Array') {
    const itemSchema = await jsonSchemaFromShapeId(
      spectacle,
      shapeChoice.asArray.shapeId
    );

    let items;

    // Instead of having a single oneOf in the items array, this flattens it to
    // make it an array for each type in the oneOf.
    if ('oneOf' in itemSchema) {
      items = itemSchema.oneOf;
    } else {
      items = [itemSchema];
    }

    return {
      type: 'array',
      items,
    };
  }

  if (shapeChoice.jsonType === 'String') {
    return { type: 'string' };
  }

  if (shapeChoice.jsonType === 'Number') {
    return { type: 'number' };
  }

  if (shapeChoice.jsonType === 'Boolean') {
    return { type: 'boolean' };
  }

  throw new TypeError(`Unknown JSON type ${shapeChoice.jsonType}`);
}

export async function queryForShape(spectacle: any, shapeId: string) {
  return await spectacle.queryWrapper({
    query: `query GetShape($shapeId: ID!) {
      shapeChoices(shapeId: $shapeId) {
        jsonType
        asArray {
          shapeId
        }
        asObject {
          fields {
            shapeId
            name
          }
        }
      }
    }`,
    variables: { shapeId },
  });
}

export type JsonSchema =
  | JsonSchemaObject
  | JsonSchemaArray
  | JsonSchemaValue
  | JsonSchemaOneOf;

export type JsonSchemaObject = {
  type: 'object';
  properties: {
    [property: string]: JsonSchema;
  };
  required?: string[];
};

export type JsonSchemaArray = {
  type: 'array';
  items: JsonSchema[];
};

export type JsonSchemaValue =
  | { type: 'string' }
  | { type: 'number' }
  | { type: 'boolean' };

export type JsonSchemaOneOf = {
  oneOf: JsonSchema[];
};
