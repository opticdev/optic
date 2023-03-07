import { DocumentedInteraction, OperationPatch } from '..';
import { diffInteractionByOperation } from '../diffs';
import { generateOperationPatchesByDiff } from '../patches';

export interface OperationPatches extends Iterable<OperationPatch> {}

export class OperationPatches {
  static *generateRequestResponseAdditions(
    documentedInteraction: DocumentedInteraction
  ): OperationPatches {
    let { interaction, operation } = documentedInteraction;

    let diffs = diffInteractionByOperation(interaction, operation);

    for (let diff of diffs) {
      let patches = generateOperationPatchesByDiff(diff, operation, {
        statusCode: interaction.response.statusCode,
      });

      for (let patch of patches) {
        if (!OperationPatch.isAddition(patch)) continue;

        operation = OperationPatch.applyTo(patch, operation).expect(
          'operation patch should apply to operation'
        );
        yield patch;
      }
    }
  }
}
