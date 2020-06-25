import express from 'express';
import bodyParser from 'body-parser';
import { delay, IdGenerator } from '@useoptic/cli-shared';
import { CaptureId } from '@useoptic/saas-types';
import {
  IInteractionPointerConverter,
  LocalCaptureInteractionContext,
} from '@useoptic/cli-shared/build/captures/avro/file-system/interaction-iterator';
import { DiffManager } from '../diffs/diff-manager';
import path from 'path';
import fs from 'fs-extra';

export interface ICaptureRouterDependencies {
  idGenerator: IdGenerator<string>;
  interactionPointerConverterFactory: (config: {
    captureId: CaptureId;
    captureBaseDirectory: string;
  }) => IInteractionPointerConverter<LocalCaptureInteractionContext>;
}

export interface ICaptureDiffMetadata {
  id: string;
  manager: DiffManager;
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

  const diffs = new Map<string, ICaptureDiffMetadata>();
  router.post(
    '/diffs',
    bodyParser.json({ limit: '100mb' }),
    async (req, res) => {
      const { captureId } = req.params;
      const { ignoreRequests, events, additionalCommands } = req.body;
      const id = dependencies.idGenerator.nextId();
      const manager = new DiffManager();
      const diffOutputPaths = getDiffOutputBaseDirectory({
        captureBaseDirectory: req.optic.paths.capturesPath,
        captureId,
        diffId: id,
      });
      await fs.ensureDir(diffOutputPaths.base);
      await fs.writeJson(diffOutputPaths.events, events);
      await fs.writeJson(diffOutputPaths.ignoreRequests, ignoreRequests);
      await fs.writeJson(
        diffOutputPaths.additionalCommands,
        additionalCommands
      );
      const workerStarted = new Promise((resolve, reject) => {
        manager.events.once('progress', resolve);
      });
      await manager.start({
        captureBaseDirectory: req.optic.paths.capturesPath,
        captureId: captureId,
        diffId: id,
      });

      await workerStarted;

      const diffMetadata = {
        id,
        manager,
      };
      diffs.set(id, diffMetadata);

      res.json({
        diffId: id,
        notificationsUrl: `${req.baseUrl}/${id}/notifications`,
      });
    }
  );

  ////////////////////////////////////////////////////////////////////////////////
  //@TODO: router.get('/diffs/:diffId/{diffs,undocumented-urls,statistics,notifications}')
  ////////////////////////////////////////////////////////////////////////////////

  router.get('/diffs/:diffId/notifications', async (req, res) => {
    const { diffId } = req.params;
    const diffMetadata = diffs.get(diffId);
    if (!diffMetadata) {
      return res.json(404);
    }

    function emit(data: any) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    const headers = {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    };
    res.writeHead(200, headers);
    emit({ type: 'message', data: {} });

    diffMetadata.manager.events.on('progress', () => {
      emit({ type: 'message', data: {} });
    });

    req.on('close', () => {
      diffMetadata.manager.stop();
    });
  });

  ////////////////////////////////////////////////////////////////////////////////

  router.get('/diffs/:diffId/diffs', async (req, res) => {
    const { captureId, diffId } = req.params;
    const diffOutputPaths = getDiffOutputBaseDirectory({
      captureBaseDirectory: req.optic.paths.capturesPath,
      captureId,
      diffId,
    });
    try {
      //@TODO: streamify
      const contents = await fs.readJson(diffOutputPaths.diffs);
      res.json(contents);
    } catch (e) {
      res.status(404).json({
        message: e.message,
      });
    }
  });
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

export function getDiffOutputBaseDirectory(values: {
  captureBaseDirectory: string;
  captureId: string;
  diffId: string;
}) {
  const { captureBaseDirectory, captureId, diffId } = values;
  const base = path.join(captureBaseDirectory, captureId, 'diffs', diffId);
  const diffs = path.join(base, 'diffs.json');
  const events = path.join(base, 'events.json');
  const ignoreRequests = path.join(base, 'ignoreRequests.json');
  const additionalCommands = path.join(base, 'additionalCommands.json');

  return {
    base,
    diffs,
    events,
    ignoreRequests,
    additionalCommands,
  };
}
