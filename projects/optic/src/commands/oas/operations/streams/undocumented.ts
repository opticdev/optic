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
import { minimatch } from 'minimatch';
import { getIgnorePaths } from '../../../../utils/specs';

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

    const ignorePatterns = getIgnorePaths(spec);

    const shouldBeIgnored = (path: string, method?: string) =>
      ignorePatterns.some((ignore) => {
        if (method && ignore.method) {
          return method === ignore.method && minimatch(path, ignore.path);
        } else {
          return minimatch(path, ignore.path);
        }
      });

    const filterMethods = (methods: OpenAPIV3.HttpMethods[]) => {
      return methods.filter((i) => i !== 'options' && i !== 'head');
    };

    for await (let operation of operations) {
      // TODO: figure out whether we can create queries once and update it incrementally,
      // recreating these facts constantly can get expens ive

      let diffs = diffOperationWithSpec(operation, spec);
      let yieldedResult = false; // needed as we're basically filtering

      for (let diff of diffs) {
        if (diff.kind === OperationDiffResultKind.UnmatchedPath) {
          const methodsFiltered = filterMethods(operation.methods);
          if (shouldBeIgnored(diff.subject)) continue;
          if (methodsFiltered.length === 0) continue;

          if (diff.subject) yieldedResult = true;
          yield {
            type: UndocumentedOperationType.MissingPath,
            pathPattern: diff.subject,
            pathParameters: PathComponents.fromPath(diff.subject)
              .filter(PathComponent.isTemplate)
              .map(({ name }) => name),
            methods: methodsFiltered,
            specPath: jsonPointerHelpers.compile(['paths', diff.subject]),
          };
        } else if (diff.kind === OperationDiffResultKind.UnmatchedMethod) {
          if (shouldBeIgnored(diff.pathPattern, diff.subject)) continue;
          if (filterMethods([diff.subject]).length === 0) continue;

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
    const operations = AT.map<CapturedInteraction, OperationPair>(
      (interaction) => {
        return {
          pathPattern: interaction.request.path,
          methods: [interaction.request.method],
        };
      }
    )(interactions);

    yield* UndocumentedOperations.fromPairs(operations, spec, specUpdates);
  }
}
