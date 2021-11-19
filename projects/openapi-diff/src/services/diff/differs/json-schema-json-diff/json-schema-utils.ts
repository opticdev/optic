import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { copyObject } from '../../../../utils/debug_waitFor';

export const removeTypeKeywords = (
  schema: OpenAPIV3.SchemaObject
): OpenAPIV3.SchemaObject => {
  const item = copyObject(schema) as OpenAPIV3.SchemaObject;

  const output = {
    description: item.description,
    title: item.title,
    externalDocs: item.externalDocs,
  };

  // remove if undefined
  Object.keys(output).forEach((key) =>
    // @ts-ignore
    output[key] === undefined ? delete output[key] : {}
  );

  return output;
};
