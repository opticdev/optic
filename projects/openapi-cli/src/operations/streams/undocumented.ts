import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  UndocumentedOperation,
  UndocumentedOperationType,
  PathComponents,
  PathComponent,
} from '..';
import { CapturedInteraction, CapturedInteractions } from '../../captures';
import { OpenAPIV3 } from '../../specs';
import { diffOperationWithSpec, OperationDiffResultKind } from '../diffs';
import * as AT from '../../lib/async-tools';
import Url from 'url';

export interface UndocumentedOperations
  extends AsyncIterable<UndocumentedOperation> {}

interface OperationPair {
  pathPattern: string;
  methods: OpenAPIV3.HttpMethods[];
}

export class UndocumentedOperations {
  static async *fromPairs(
    operations: AsyncIterable<OperationPair>,
    spec: OpenAPIV3.Document,
    specUpdates?: AsyncIterable<OpenAPIV3.Document>
  ): UndocumentedOperations {
    const specUpdatesIterator =
      specUpdates && specUpdates[Symbol.asyncIterator]();

    for await (let operation of operations) {
      // TODO: figure out whether we can create queries once and update it incrementally,
      // recreating these facts constantly can get expens ive

      let diffs = diffOperationWithSpec(operation, spec);
      let yieldedResult = false; // needed as we're basically filtering

      for (let diff of diffs) {
        if (diff.kind === OperationDiffResultKind.UnmatchedPath) {
          yieldedResult = true;
          yield {
            type: UndocumentedOperationType.MissingPath,
            pathPattern: diff.subject,
            pathParameters: PathComponents.fromPath(diff.subject)
              .filter(PathComponent.isTemplate)
              .map(({ name }) => name),
            methods: operation.methods,
            specPath: jsonPointerHelpers.compile(['paths', diff.subject]),
          };
        } else if (diff.kind === OperationDiffResultKind.UnmatchedMethod) {
          yieldedResult = true;
          yield {
            type: UndocumentedOperationType.MissingMethod,
            pathPattern: diff.pathPattern,
            method: diff.subject,
            specPath: jsonPointerHelpers.compile([
              'paths',
              diff.pathPattern,
              diff.subject,
            ]),
          };
        }
      }

      if (specUpdatesIterator && yieldedResult) {
        let newSpec = await specUpdatesIterator.next();
        spec = newSpec.value;
      }
    }
  }

  static async *fromCapturedInteractions(
    interactions: CapturedInteractions,
    spec: OpenAPIV3.Document,
    specUpdates?: AsyncIterable<OpenAPIV3.Document>
  ): UndocumentedOperations {

    const basePaths =
      spec.servers?.map((server) => {
        // add absolute in case url is relative (valid in OpenAPI, ignored when absolute)
        const parsed = new Url.URL(server.url, 'https://example.org');

        const pathName = parsed.pathname;
        if (pathName.endsWith('/') && pathName.length > 1) {
          return pathName.substring(0, pathName.length - 1)
        } else {
          return pathName
        }
      }) || [];

    const operations = AT.map<CapturedInteraction, OperationPair>(
      (interaction) => {
        const basePath = basePaths.find((basePath) =>
          interaction.request.path.startsWith(basePath)
        );

        const offset = basePath ? basePath.length : 0;

        return {
          pathPattern: interaction.request.path.substring(offset),
          methods: [interaction.request.method],
        };
      }
    )(interactions);

    yield* UndocumentedOperations.fromPairs(operations, spec, specUpdates);
  }
}
