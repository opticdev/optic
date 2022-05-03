import { DocumentedInteraction } from '..';

// TODO: move these
export interface OperationPatch {}
export class OperationPatch {}

export interface OperationPatches extends Iterable<OperationPatch> {}

export class OperationPatches {
  static *generateRequestResponseAdditions(
    documentedInteraction: DocumentedInteraction
  ): OperationPatches {}
}
