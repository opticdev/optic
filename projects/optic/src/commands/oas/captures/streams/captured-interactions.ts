import { CapturedInteraction } from '..';
import { HarEntries } from './sources/har';
import { ProxyInteractions } from './sources/proxy';

export interface CapturedInteractions
  extends AsyncIterable<CapturedInteraction> {}

export class CapturedInteractions {
  static async *fromHarEntries(entries: HarEntries): CapturedInteractions {
    for await (let entry of entries) {
      yield CapturedInteraction.fromHarEntry(entry);
    }
  }

  static async *fromProxyInteractions(
    interactions: ProxyInteractions
  ): CapturedInteractions {
    for await (let interaction of interactions) {
      yield CapturedInteraction.fromProxyInteraction(interaction);
    }
  }
}
