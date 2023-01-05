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
import minimatch from 'minimatch';

export interface UndocumentedOperations
  extends AsyncIterable<UndocumentedOperation> {}

interface OperationPair {
  pathPattern: string;
  onApiBasePath: boolean;
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

    const ignorePatterns: string[] = Array.isArray(spec['x-optic-path-ignore'])
      ? spec['x-optic-path-ignore'].map((i) => i.toString())
      : []; // default ignore patterns

    const shouldBeIgnored = (path: string) =>
      ignorePatterns.some((ignore) => minimatch(path, ignore));

    const filterMethods = (methods: OpenAPIV3.HttpMethods[]) => {
      return methods.filter((i) => i !== 'options' && i !== 'head');
    };

    for await (let operation of operations) {
      if (!operation.onApiBasePath) continue;

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
          if (shouldBeIgnored(diff.subject)) continue;
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
    const hostBaseMap: { [key: string]: string } = {};

    spec.servers?.forEach((server) => {
      // add absolute in case url is relative (valid in OpenAPI, ignored when absolute)
      const parsed = new Url.URL(server.url, 'https://example.org');

      const pathName = parsed.pathname;
      if (pathName.endsWith('/') && pathName.length > 1) {
        hostBaseMap[parsed.host] = pathName.substring(0, pathName.length - 1);
      } else {
        hostBaseMap[parsed.host] = pathName;
      }
    });

    const operations = AT.map<CapturedInteraction, OperationPair>(
      (interaction) => {
        const basePath: string = hostBaseMap[interaction.request.host] || '/';

        const hasBathPath = basePath !== '/';

        const offset = hasBathPath ? basePath.length : 0;

        const pathPattern =
          hasBathPath && interaction.request.path.startsWith(basePath)
            ? interaction.request.path.substring(offset)
            : interaction.request.path;

        return {
          pathPattern,
          onApiBasePath: interaction.request.path.startsWith(basePath),
          methods: [interaction.request.method],
        };
      }
    )(interactions);

    yield* UndocumentedOperations.fromPairs(operations, spec, specUpdates);
  }
}
