import { DocumentedInteraction, Operation } from '..';
import { CapturedInteractions } from '../../captures';
import { OpenAPIV3 } from '../../specs';

export interface DocumentedInteractions
  extends AsyncIterable<DocumentedInteraction> {}

export class DocumentedInteractions {
  static async *fromCapturedInteractions(
    interactions: CapturedInteractions,
    spec: OpenAPIV3.Document
  ): AsyncIterable<DocumentedInteraction> {
    for await (let interaction of interactions) {
      // find matching interaction operation by matching path and method
    }
  }
}
