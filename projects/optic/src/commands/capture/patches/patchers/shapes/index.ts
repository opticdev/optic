import { Result } from 'ts-results';
import { Body, SchemaObject } from '../../../../oas/shapes';
import {
  ShapeDiffTraverser,
  SchemaCompilationError,
  ShapeDiffResult,
} from './diff';

export function diffBodyBySchema(
  body: Body,
  schema: SchemaObject
): Result<IterableIterator<ShapeDiffResult>, SchemaCompilationError> {
  let traverser = new ShapeDiffTraverser();
  return traverser.traverse(body.value, schema).map(() => traverser.results());
}
