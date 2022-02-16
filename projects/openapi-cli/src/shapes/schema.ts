import { OpenAPIV3 } from '../specs/index';
import { diffBodyBySchema } from '.';
import { ShapeDiffResult, ShapeDiffResultKind } from './diffs';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export type SchemaObject = OpenAPIV3.SchemaObject;

export class Schema {
  static fromShapeDiff(
    diff: ShapeDiffResult & { kind: ShapeDiffResultKind.AdditionalProperty }
  ): SchemaObject {
    const propertyValue = jsonPointerHelpers.get(
      diff.example,
      diff.propertyExamplePath
    );

    const root = initialSchema(propertyValue);

    console.warn(
      'TODO: generate entire json schema for example from shape diff, not just initial type'
    );

    return root;
  }
}

function initialSchema(rootInput: any): OpenAPIV3.SchemaObject {
  if (rootInput === null) {
    // @ts-ignore, this is ok now.
    return { type: 'null' };
  } else if (Array.isArray(rootInput)) {
    return {
      type: 'array',
      items: rootInput.length ? initialSchema(rootInput[0]) : {},
    };
  } else if (typeof rootInput === 'object') {
    return { type: 'object' };
  } else if (typeof rootInput === 'string') {
    return { type: 'string' };
  } else if (typeof rootInput === 'number') {
    return { type: 'number' };
  } else if (typeof rootInput === 'boolean') {
    return { type: 'boolean' };
  } else {
    throw new Error('Could not learn JSON Schema');
  }
}
