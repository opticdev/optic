import {
  ShapeDiffTraverser,
  JsonSchemaKnownKeyword,
  SchemaCompilationError,
} from './traverser';
import { ShapeDiffResult, ShapeDiffResultKind } from './result';
import { Body } from '../body';
import { SchemaObject } from '../schema';
import { Result } from 'ts-results';

export type { ShapeDiffResult };
export { ShapeDiffResultKind };
export { JsonSchemaKnownKeyword };
export { SchemaCompilationError };

export function diffBodyBySchema(
  body: Body,
  schema: SchemaObject
): Result<IterableIterator<ShapeDiffResult>, SchemaCompilationError> {
  let traverser = new ShapeDiffTraverser();
  return traverser.traverse(body.value, schema).map(() => traverser.results());
}
