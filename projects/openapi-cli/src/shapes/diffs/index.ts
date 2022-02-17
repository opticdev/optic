import { ShapeDiffTraverser } from './traverser';
import { ShapeDiffResult, ShapeDiffResultKind } from './result';
import { Body, SchemaObject } from '../body';

export type { ShapeDiffResult, ShapeDiffResultKind };

export function* diffBodyBySchema(
  body: Body,
  schema: SchemaObject
): IterableIterator<ShapeDiffResult> {
  let traverser = new ShapeDiffTraverser();
  traverser.traverse(body, schema);
  yield* traverser.results();
}
