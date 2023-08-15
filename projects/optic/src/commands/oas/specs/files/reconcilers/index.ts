import { Operation } from '../../../../capture/patches/patchers/spec/patches';

export { applyPatch } from './stringify';

export interface SpecFileReconciler<Config> {
  (
    filePath: string,
    fileContents: string,
    operations: Operation[],
    config?: Config
  ): Promise<PatchApplyResult>;
}
export type PatchApplyResult =
  | { contents: string; success: true; filePath: string }
  | { error: string; success: false; filePath: string };
