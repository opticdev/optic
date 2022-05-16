import { CapturedInteraction } from '..';
import { HarEntries } from './sources/har';

export interface CapturedInteractions
  extends AsyncIterable<CapturedInteraction> {}

export class CapturedInteractions {
  static async *fromHarEntries(entries: HarEntries): CapturedInteractions {
    for await (let entry of entries) {
      yield CapturedInteraction.fromHarEntry(entry);
    }
  }
}
