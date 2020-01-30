import {IApiInteraction, opticEngine, toInteraction} from './index';
import * as fs from 'fs-extra';

export async function checkDiffOrUnrecognizedPath(specStorePath: string, samples: IApiInteraction[]) {
  const specStoreExists = await fs.pathExists(specStorePath);
  if (!specStoreExists) {
    return Promise.resolve(true);
  }
  const specAsBuffer = await fs.readFile(specStorePath);
  try {
    const differ = opticEngine.com.useoptic.diff.SessionDiffer(specAsBuffer.toString());
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
