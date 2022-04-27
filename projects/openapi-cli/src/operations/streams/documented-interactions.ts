import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { DocumentedInteraction, Operation } from '..';
import { CapturedInteractions } from '../../captures';
import { OpenAPIV3 } from '../../specs';
import { diffInteractionBySpec } from '../diffs';
import { OperationDiffResultKind } from '../diffs/result';

export interface DocumentedInteractions
  extends AsyncIterable<DocumentedInteraction> {}

export class DocumentedInteractions {
  static async *fromCapturedInteractions(
    interactions: CapturedInteractions,
    spec: OpenAPIV3.Document
  ): AsyncIterable<DocumentedInteraction> {
    interactionsLoop: for await (let interaction of interactions) {
      let diffResults = diffInteractionBySpec(interaction, spec);

      let operation: Operation | null = null;
      let specJsonPath: string | null = null;

      for (let diffResult of diffResults) {
        if (
          diffResult.kind === OperationDiffResultKind.UnmatchedPath ||
          diffResult.kind === OperationDiffResultKind.UnmatchedMethod
        ) {
          // no matching operation could be found, so this is not a documented interaction
          // so we skip it
          continue interactionsLoop;
        } else if (diffResult.kind === OperationDiffResultKind.Matched) {
          let { path, method, operationPath } = diffResult;
          let op = jsonPointerHelpers.get(
            spec,
            operationPath
          ) as OpenAPIV3.OperationObject;

          operation = { path, method, ...op };
          specJsonPath = operationPath;
        }
      }

      if (!operation || !specJsonPath) continue; // we never found a matching operation

      yield {
        interaction,
        operation,
        specJsonPath,

        // TODO: include matched response and request bodies
        responseBody: null,
        requestBody: null,
      };
    }
  }
}
