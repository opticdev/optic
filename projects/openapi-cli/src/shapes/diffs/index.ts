import { ShapeDiffTraverser, JsonSchemaKnownKeyword } from './traverser';
import { ShapeDiffResult, ShapeDiffResultKind } from './result';
import { Body, SchemaObject } from '../body';

export type { ShapeDiffResult };
export { ShapeDiffResultKind };
export { JsonSchemaKnownKeyword };

export function* diffBodyBySchema(
  body: Body,
  schema: SchemaObject
): IterableIterator<ShapeDiffResult> {
  yield* diffValueBySchema(body.value, schema);
}

export function* diffValueBySchema(
  value: any,
  schema: SchemaObject
): IterableIterator<ShapeDiffResult> {
  let traverser = new ShapeDiffTraverser();
  traverser.traverse(value, schema);
  yield* traverser.results();
}
