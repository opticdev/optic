import { NormalizedCiContext } from '../../types';
import { loadFile, normalizeCiContext } from '.';
import path from 'path';
import { DEFAULT_CONTEXT_PATH } from '../constants';
import { UserError } from '../../errors';

export async function loadCiContext(
  ciProvider: 'github' | 'circleci',
  ciContext?: string
): Promise<NormalizedCiContext> {
  let normalizedCiContext: NormalizedCiContext;
  if (ciContext) {
    // Legacy flow
    // https://github.com/opticdev/issues/issues/236 - to deprecate
    try {
      const contextFileBuffer = await loadFile(ciContext);
      normalizedCiContext = normalizeCiContext(ciProvider, contextFileBuffer);
    } catch (e) {
      console.error(e);
      throw new UserError();
    }
  } else {
    console.log(
      `Attempting to read context from default context path ${path.join(
        process.cwd(),
        DEFAULT_CONTEXT_PATH
      )}`
    );

    // New flow - implicit assumption of using `optic-ci create-context`;
    // TODO also allow users to specify the paths - also requires validation
    try {
      const contextFileBuffer = await loadFile(DEFAULT_CONTEXT_PATH);
      console.log(
        `Found context file from default path ${path.join(
          process.cwd(),
          DEFAULT_CONTEXT_PATH
        )}`
      );
      normalizedCiContext = JSON.parse(contextFileBuffer.toString());
    } catch (e) {
      console.error(e);
      throw new UserError();
    }
  }
  return normalizedCiContext;
}
