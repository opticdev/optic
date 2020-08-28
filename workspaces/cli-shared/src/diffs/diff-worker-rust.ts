import { parseIgnore } from '@useoptic/cli-config';
import { IHttpInteraction } from '@useoptic/domain-types';
import {
  CaptureInteractionIterator,
  LocalCaptureInteractionPointerConverter,
} from '../captures/avro/file-system/interaction-iterator';
import { ScalaJSHelpers } from '@useoptic/domain';
import fs from 'fs-extra';
import path from 'path';
import lockfile from 'proper-lockfile';
import Chain, { chain } from 'stream-chain';
import Execa from 'execa';
import { Readable } from 'stream';
import { disassembler as JSONDissambler } from 'stream-json/Disassembler';
import { stringer as JSONLStringer } from 'stream-json/jsonl/Stringer';

export interface IDiffProjectionEmitterConfig {
  diffId: string;
  specFilePath: string;
  ignoreRequestsFilePath: string;
  filtersFilePath: string;
  additionalCommandsFilePath: string;
  captureBaseDirectory: string;
  captureId: string;
}

export function getDiffOutputPaths(values: {
  captureBaseDirectory: string;
  captureId: string;
  diffId: string;
}) {
  const { captureBaseDirectory, captureId, diffId } = values;
  const base = path.join(captureBaseDirectory, captureId, 'diffs', diffId);
  const diffs = path.join(base, 'diffs.jsonl');
  const stats = path.join(base, 'stats.json');
  const undocumentedUrls = path.join(base, 'undocumentedUrls.json');
  const events = path.join(base, 'events.json');
  const ignoreRequests = path.join(base, 'ignoreRequests.json');
  const filters = path.join(base, 'filters.json');
  const additionalCommands = path.join(base, 'additionalCommands.json');

  return {
    base,
    diffs,
    stats,
    undocumentedUrls,
    events,
    ignoreRequests,
    filters,
    additionalCommands,
  };
}

async function safeWriteJson(filePath: string, contents: any) {
  await fs.ensureFile(filePath);
  await lockfile.lock(filePath);
  await fs.writeJson(filePath, contents);
  await lockfile.unlock(filePath);
}

export class DiffWorkerRust {
  constructor(private config: IDiffProjectionEmitterConfig) {}

  async run() {
    console.log('running');

    function notifyParentOfError(e: Error) {
      if (process && process.send) {
        process.send({
          type: 'error',
          data: {
            message: e.message,
          },
        });
      } else {
        console.error(e);
      }
    }

    try {
      console.time('load inputs');
      const [ignoreRequests, filters] = await Promise.all([
        fs.readJson(this.config.ignoreRequestsFilePath),
        fs.readJson(this.config.filtersFilePath),
      ]);
      console.timeEnd('load inputs');
      const ignoredRequests = parseIgnore(ignoreRequests);

      function filterIgnoredRequests(interaction: IHttpInteraction) {
        return !ignoredRequests.shouldIgnore(
          interaction.request.method,
          interaction.request.path
        );
      }

      // function filterByEndpoint(endpoint: { pathId: string; method: string }) {
      //   return function (interaction: IHttpInteraction) {
      //     const pathId = ScalaJSHelpers.getOrUndefined(
      //       undocumentedUrlHelpers.tryResolvePathId(interaction.request.path)
      //     );
      //     return (
      //       endpoint.method === interaction.request.method &&
      //       endpoint.pathId === pathId &&
      //       !ignoredRequests.shouldIgnore(
      //         interaction.request.method,
      //         interaction.request.path
      //       )
      //     );
      //   };
      // }

      // const interactionFilter =
      //   filters.length > 0
      //     ? filterByEndpoint(filters[0])
      //     : filterIgnoredRequests;
      //
      // TODO: re-enable or reconsider filtering by endpoints, disabled now as we're
      // trying to not read the spec with Scala
      const interactionFilter = filterIgnoredRequests;
      const interactionIterator = CaptureInteractionIterator(
        {
          captureId: this.config.captureId,
          captureBaseDirectory: this.config.captureBaseDirectory,
        },
        interactionFilter
      );

      let hasMoreInteractions = true;
      let diffedInteractionsCounter = BigInt(0);
      let skippedInteractionsCounter = BigInt(0);
      const diffOutputPaths = getDiffOutputPaths(this.config);

      function notifyParent() {
        const progress = {
          diffedInteractionsCounter: diffedInteractionsCounter.toString(),
          skippedInteractionsCounter: skippedInteractionsCounter.toString(),
          hasMoreInteractions,
        };
        if (process && process.send) {
          process.send({
            type: 'progress',
            data: progress,
          });
        } else {
          console.log(progress);
        }
      }

      const interactionPointerConverter = new LocalCaptureInteractionPointerConverter(
        {
          captureBaseDirectory: this.config.captureBaseDirectory,
          captureId: this.config.captureId,
        }
      );

      await fs.ensureDir(diffOutputPaths.base);

      let count = 0;
      const interactionsStream = chain([
        Readable.from(interactionIterator),
        (item) => {
          count++;
          skippedInteractionsCounter = item.skippedInteractionsCounter;
          diffedInteractionsCounter = item.diffedInteractionsCounter;
          hasMoreInteractions = item.hasMoreInteractions;
          if (!item.hasMoreInteractions) {
            return Chain.final();
          }

          if (count > 10) return Chain.final();

          if (!item.interaction) return;

          const { batchId, index } = item.interaction.context;
          let interactionPointer = interactionPointerConverter.toPointer(
            item.interaction.value,
            {
              interactionIndex: index,
              batchId,
            }
          );

          return [[item.interaction.value, interactionPointer]];
        },
        JSONLStringer(),
      ]);
      const eventsSink = fs.createWriteStream(diffOutputPaths.diffs);

      // TODO: find the actual way we'll use to point to a built binary
      // taking in consideration that in development that's probably a
      // debug build, while in production a release build
      const differPath = path.resolve(
        path.join(__dirname, '../../../../diff/target/debug/optic_diff')
      );
      let diffProcess = Execa(differPath, [diffOutputPaths.events], {
        input: interactionsStream,
        stdio: 'pipe',
      });
      if (!diffProcess.stdout || !diffProcess.stderr)
        throw new Error('diff process should have stdout and stderr streams');
      diffProcess.stdout.pipe(eventsSink);
      diffProcess.stderr.pipe(process.stderr);
    } catch (e) {
      notifyParentOfError(e);
    }
  }
}
