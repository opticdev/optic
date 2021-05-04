import express from 'express';
import bodyParser from 'body-parser';
import { IdGenerator } from '@useoptic/cli-shared';
import { CaptureId } from '@useoptic/saas-types';
import {
  IInteractionPointerConverter,
  LocalCaptureInteractionContext,
} from '@useoptic/cli-shared/build/captures/avro/file-system/interaction-iterator';
import { chain } from 'stream-chain';
import { stringer as jsonStringer } from 'stream-json/Stringer';
import { disassembler as jsonDisassembler } from 'stream-json/Disassembler';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { replace as jsonReplace } from 'stream-json/filters/Replace';
import { Duplex, Readable } from 'stream';
import { OnDemandInitialBodyRust } from '../tasks/on-demand-initial-body-rust';
import { Diff } from '../diffs';
import { OnDemandShapeDiffAffordancesRust } from '../tasks/on-demand-trail-values-rust';
import * as opticEngine from '@useoptic/diff-engine-wasm/engine/build';

export interface ICaptureRouterDependencies {
  idGenerator: IdGenerator<string>;
  interactionPointerConverterFactory: (config: {
    captureId: CaptureId;
    captureBaseDirectory: string;
  }) => IInteractionPointerConverter<LocalCaptureInteractionContext>;
}

export interface ICaptureDiffMetadata {
  id: string;
  manager: Diff;
}

export function makeRouter(dependencies: ICaptureRouterDependencies) {
  const router = express.Router({ mergeParams: true });

  router.put('/status', bodyParser.json({ limit: '1kb' }), async (req, res) => {
    const { status } = req.body;
    if (status !== 'completed') {
      debugger;
      return res.sendStatus(400);
    }
    try {
      const { captureId } = req.params;
      const captureInfo = await req.optic.capturesHelpers.loadCaptureState(
        captureId
      );
      captureInfo.status = 'completed';
      await req.optic.capturesHelpers.updateCaptureState(captureInfo);
      res.sendStatus(204);
    } catch (e) {
      console.error(e);
      debugger;
      return res.sendStatus(400);
    }
  });

  router.get('/status', async (req, res) => {
    try {
      const { captureId } = req.params;
      const captureInfo = await req.optic.capturesHelpers.loadCaptureState(
        captureId
      );
      const captureSummary = await req.optic.capturesHelpers.loadCaptureSummary(
        captureId
      );
      res.json({
        status: captureInfo.status,
        diffsCount: captureSummary.diffsCount,
        interactionsCount: captureSummary.interactionsCount,
      });
    } catch (e) {
      return res.sendStatus(400);
    }
  });

  ////////////////////////////////////////////////////////////////////////////////
  router.post(
    '/initial-bodies',
    bodyParser.json({ limit: '100mb' }),
    async (req, res) => {
      const { captureId } = req.params;
      //@aidan: here you need to receive the additional commands
      const { pathId, method, additionalCommands } = req.body;

      const events = await req.optic.specLoader();

      const newEventsString = opticEngine.try_apply_commands(
        JSON.stringify(additionalCommands),
        JSON.stringify(events),
        'simulated',
        'simulated-batch'
      );

      //@aidan: here you need to apply the additional commands
      const initialBodyGenerator = new OnDemandInitialBodyRust({
        captureBaseDirectory: req.optic.paths.capturesPath,
        events: [...events, ...JSON.parse(newEventsString)],
        captureId,
        pathId,
        method,
      });

      console.time('learn ' + pathId + method);
      // TODO: pass results stream straight through instead of buffering into memory
      const result = initialBodyGenerator.run();
      result.then((learnedBodies: ILearnedBodies) => {
        console.timeEnd('learn ' + pathId + method);
        res.json(learnedBodies);
      });
      result.catch((e) => {
        res.status(500).json({
          message: e.message,
        });
      });
    }
  );

  ////////////////////////////////////////////////////////////////////////////////

  router.post(
    '/trail-values',
    bodyParser.json({ limit: '100mb' }),
    async (req, res) => {
      const { captureId } = req.params;
      const { diffId } = req.body;
      const events = await req.optic.specLoader();

      const onDemandTrailValues = new OnDemandShapeDiffAffordancesRust({
        captureBaseDirectory: req.optic.paths.capturesPath,
        diffId,
        events: events,
        captureId,
      });

      const result = onDemandTrailValues.run();

      result.then((shapeDiffAffordancesByFingerprint) => {
        res.json(shapeDiffAffordancesByFingerprint);
      });
      result.catch((e) => {
        res.status(500).json({
          message: e.message,
        });
      });
    }
  );

  ////////////////////////////////////////////////////////////////////////////////

  router.get('/interactions/:interactionPointer', async (req, res) => {
    const { captureId, interactionPointer } = req.params;
    const interactionPointerConverter = dependencies.interactionPointerConverterFactory(
      {
        captureBaseDirectory: req.optic.paths.capturesPath,
        captureId,
      }
    );
    const interaction = await interactionPointerConverter.fromPointer(
      interactionPointer
    );
    res.json({
      interaction,
    });
  });

  ////////////////////////////////////////////////////////////////////////////////

  return router;
}

function toJSONArray(
  itemsStream: Readable,
  wrap?: {
    base: { [key: string]: any };
    path: string;
  }
): Duplex {
  let tokenStream = chain([itemsStream, jsonDisassembler()]);
  if (!wrap) return tokenStream.pipe(jsonStringer({ makeArray: true }));

  let ARRAY_ITEM_MARKER = { name: 'array_insert_marker ' };
  let objectTokenStream = chain([
    Readable.from([wrap.base]),
    jsonDisassembler(),
    jsonReplace({
      filter: wrap.path,
      once: true,
      allowEmptyReplacement: false,
      replacement: () => [
        { name: 'startArray' },
        ARRAY_ITEM_MARKER,
        { name: 'endArray' },
      ],
    }),
  ]);

  let outputGenerator = async function* (
    wrapTokenStream: Readable,
    arrayTokenStream: Readable,
    marker: any
  ) {
    for await (let wrapToken of wrapTokenStream) {
      if (wrapToken === marker) {
        for await (let arrayToken of arrayTokenStream) {
          yield arrayToken;
        }
      } else {
        yield wrapToken;
      }
    }
  };

  return Readable.from(
    outputGenerator(objectTokenStream, tokenStream, ARRAY_ITEM_MARKER)
  ).pipe(jsonStringer());
}

function toJSONObject(): Duplex {
  return chain([jsonDisassembler(), jsonStringer({ makeArray: true })]);
}
