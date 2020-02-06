import {IApiInteraction, opticEngine, toInteraction} from './index';

export async function checkDiffOrUnrecognizedPath(specStoreContents: string, samples: IApiInteraction[]) {
  try {
    const differ = opticEngine.com.useoptic.diff.SessionDiffer(specStoreContents);
    for (const s of samples) {
      const interaction = toInteraction(s);
      if (differ.hasUnrecognizedPath(interaction) || differ.hasDiff(interaction)) {
        return Promise.resolve(true);
      }
    }
  } catch (e) {
    console.error(e);
    return Promise.resolve(false);
  }
}
