import express from 'express';
import bodyParser from 'body-parser';
import Bottleneck from 'bottleneck';
import { IdGenerator } from '@useoptic/cli-shared';
import { CaptureId } from '@useoptic/saas-types';
import {
  IInteractionPointerConverter,
  LocalCaptureInteractionContext,
} from '@useoptic/cli-shared/build/captures/avro/file-system/interaction-iterator';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { OnDemandInitialBodyRust } from '../tasks/on-demand-initial-body-rust';
import { OnDemandShapeDiffAffordancesRust } from '../tasks/on-demand-trail-values-rust';
import * as opticEngine from '@useoptic/optic-engine-wasm';

export interface ICaptureRouterDependencies {
  idGenerator: IdGenerator<string>;
  interactionPointerConverterFactory: (config: {
    captureId: CaptureId;
    captureBaseDirectory: string;
  }) => IInteractionPointerConverter<LocalCaptureInteractionContext>;
  fileReadBottleneck: Bottleneck;
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
      const { pathId, method, additionalCommands } = req.body;

      const events = await req.optic.specLoader();

      const newEventsString = opticEngine.try_apply_commands(
        JSON.stringify(additionalCommands),
        JSON.stringify(events),
        'simulated-batch',
        'simulated changes',
        'simulated-client',
        'simulated-session'
      );

      const initialBodyGenerator = new OnDemandInitialBodyRust({
        captureBaseDirectory: req.optic.paths.capturesPath,
        events: [...events, ...JSON.parse(newEventsString)],
        captureId,
        pathId,
        method,
      });

      console.time('scheduling ' + pathId + method);
      // TODO: pass results stream straight through instead of buffering into memory
      const result = dependencies.fileReadBottleneck.schedule(() => {
        console.timeEnd('scheduling ' + pathId + method);
        console.time('executing learning ' + pathId + method);
        return initialBodyGenerator.run();
      });
      result.then((learnedBodies: ILearnedBodies) => {
        console.timeEnd('executing learning ' + pathId + method);
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
