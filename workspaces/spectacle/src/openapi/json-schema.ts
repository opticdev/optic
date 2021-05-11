export async function jsonSchemaFromShapeId(
  spectacle: any,
  shapeId: string
): Promise<JsonSchema> {
  const shape = await queryForShape(spectacle, shapeId);

  // We ignore Undefined here because we check in when dealing with Object
  const shapeChoices = shape.data.shapeChoices.filter(
    (shapeChoice: any) => shapeChoice.jsonType !== 'Undefined'
  );

  const schemas: JsonSchemaType[] = await Promise.all(
    shapeChoices.map(async (shapeChoice: any) => {
      return await jsonSchemaFromShapeChoice(spectacle, shapeChoice);
    })
  );

  // jsonSchemaFromShapeChoice can return `{ type: 'null' }`, but OpenAPI 3.0.3 cannot handle this type
  // Instead, it requires using a `nullable` property.
  let isNullable = false;

  // This is how we find out if the schemas are nullable while removing any `{ type: 'null' }`
  // from the final results.
  const openApiSchemas: JsonSchemaType[] = schemas.filter((schema) => {
    if (schema.type === 'null') {
      isNullable = true;
      return false;
    }
    return true;
  });

  // This happens when there is only a null type
  // We are taking liberties here to set the type as string, which may not be correct.
  if (isNullable && openApiSchemas.length === 0) {
    return { nullable: true };
  }

  // TODO: investigate why this scenario happens
  // This can happen if there are no shapeChoices
  if (openApiSchemas.length === 0) {
    return {};
  }

  // This means it's nullable with additional types to for setting `nullable: true`.
  if (isNullable) {
    for (const schema of openApiSchemas) {
      if (schema.type !== 'null') schema.nullable = true;
    }
  }

  if (openApiSchemas.length === 1) return openApiSchemas[0];

  // In some cases, it might be nicer to do { type: [string, number] }, but this
  // isn't supported in OpenAPI. Leaving it as oneOf for now.
  return { oneOf: openApiSchemas };
}

export async function jsonSchemaFromShapeChoice(
  spectacle: any,
  shapeChoice: any
): Promise<JsonSchemaType> {
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

    return {
      type: 'array',
      items: itemSchema,
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

  if (shapeChoice.jsonType === 'Null') {
    return { type: 'null' };
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

export type JsonSchema = JsonSchemaType | JsonSchemaOneOf;

export type JsonSchemaType =
  | JsonSchemaObject
  | JsonSchemaArray
  | JsonSchemaValue;

export type JsonSchemaObject = {
  type: 'object';
  properties: {
    [property: string]: JsonSchema;
  };
  required?: string[];
  nullable?: boolean;
};

export type JsonSchemaArray = {
  type: 'array';
  items: JsonSchema;
  nullable?: boolean;
};

export type JsonSchemaValue =
  | {
      type?: 'string' | 'number' | 'boolean';
      nullable?: boolean;
    }
  | { type: 'null' };

export type JsonSchemaOneOf = {
  oneOf: JsonSchema[];
};
