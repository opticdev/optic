import {
  ShapeDiffTraverser,
  JsonSchemaKnownKeyword,
  SchemaCompilationError,
} from './traverser';
import { ShapeDiffResult, ShapeDiffResultKind } from './result';
import { Body } from '../body';
import { SchemaObject } from '../schema';
import { Result, Ok, Err } from 'ts-results';

export type { ShapeDiffResult };
export { ShapeDiffResultKind };
export { JsonSchemaKnownKeyword };
export { SchemaCompilationError };

export function diffBodyBySchema(
  body: Body,
  schema: SchemaObject
): ReturnType<typeof diffValueBySchema> {
  return diffValueBySchema(body.value, schema);
}

export function diffValueBySchema(
  value: any,
  schema: SchemaObject
): Result<IterableIterator<ShapeDiffResult>, SchemaCompilationError> {
  let traverser = new ShapeDiffTraverser();
  return traverser.traverse(value, schema).map(() => traverser.results());
}
