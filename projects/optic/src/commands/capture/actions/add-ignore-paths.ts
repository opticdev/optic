import { ParseResult } from '../../../utils/spec-loaders';
import { SpecPatches } from '../../oas/specs';
import { getIgnorePathPatch } from '../patches/patchers/spec';
import { jsonOpsFromSpecPatches } from '../patches/patches';
import { writePatchesToFiles } from '../write/file';

export async function addIgnorePaths(
  parseResult: ParseResult,
  ignorePaths: { method: string; path: string }[]
) {
  const specPatches: SpecPatches = (async function* (): SpecPatches {
    yield getIgnorePathPatch(parseResult.jsonLike, ignorePaths);
  })();

  const operations = await jsonOpsFromSpecPatches(specPatches);
  await writePatchesToFiles(operations, parseResult.sourcemap);
}
