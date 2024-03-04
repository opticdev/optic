import { ParseResult } from '../../../utils/spec-loaders';
import { SpecPatches } from '../patches/patchers/spec/patches';
import { getIgnorePathPatch } from '../patches/patchers/spec/spec';
import { jsonOpsFromSpecPatches } from '../patches/patches';
import { writePatchesToFiles } from '../write/file';

export async function addIgnorePaths(
  parseResult: Exclude<ParseResult, { version: '2.x.x' }>,
  ignorePaths: { method: string; path: string }[]
) {
  const specPatches: SpecPatches = (async function* (): SpecPatches {
    yield getIgnorePathPatch(parseResult.jsonLike, ignorePaths);
  })();

  const operations = await jsonOpsFromSpecPatches(specPatches);
  await writePatchesToFiles(operations, parseResult.sourcemap);
}
