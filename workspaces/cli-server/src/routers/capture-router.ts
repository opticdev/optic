import express from 'express';
import bodyParser from 'body-parser';
import { IdGenerator } from '@useoptic/cli-shared';
import { CaptureId } from '@useoptic/saas-types';
import {
  IInteractionPointerConverter,
  LocalCaptureInteractionContext,
} from '@useoptic/cli-shared/build/captures/avro/file-system/interaction-iterator';
import { DiffManager } from '../diffs/diff-manager';
import fs from 'fs-extra';
import { getDiffOutputPaths } from '@useoptic/cli-shared/build/diffs/diff-worker';
import lockfile from 'proper-lockfile';
import { chain, final } from 'stream-chain';
import { stringer as jsonStringer } from 'stream-json/Stringer';
import {
  disassembler,
  disassembler as jsonDisassembler,
} from 'stream-json/Disassembler';
import { parser as jsonlParser } from 'stream-json/jsonl/Parser';
import { replace as jsonReplace } from 'stream-json/filters/Replace';
import { Duplex, Readable } from 'stream';

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
      const { ignoreRequests, events, additionalCommands, filters } = req.body;

      let diff;
      try {
        diff = await req.optic.session.diffCapture(captureId, filters);
      } catch (e) {
        return res.status(500).json({ message: e.message });
      }

      const diffMetadata = {
        id: diff.id,
        manager: diff,
      };
      diffs.set(diff.id, diffMetadata);

      res.json({
        diffId: diff.id,
        notificationsUrl: `${req.baseUrl}/diffs/${diff.id}/notifications`,
      });
    }
  );

  ////////////////////////////////////////////////////////////////////////////////

  router.get('/diffs/:diffId/notifications', async (req, res) => {
    const { diffId } = req.params;
    const diffMetadata = diffs.get(diffId);
    if (!diffMetadata) {
      return res.json(404);
    }

    function emit(data: any) {
      console.log('emit');
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    const headers = {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    };
    res.writeHead(200, headers);
    emit({
      type: 'message',
      data: diffMetadata.manager.latestProgress() || {},
    });

    diffMetadata.manager.events.on('progress', (data) => {
      emit({ type: 'message', data });
    });
    diffMetadata.manager.events.on('error', (data) => {
      emit({ type: 'error', data });
    });

    req.on('close', () => {
      diffMetadata.manager.stop();
      diffs.delete(diffId);
    });
  });

  ////////////////////////////////////////////////////////////////////////////////

  router.get('/diffs/:diffId/diffs', async (req, res) => {
    const { captureId, diffId } = req.params;

    const diffMetadata = diffs.get(diffId);
    if (!diffMetadata) {
      return res.json(404);
    }
    const diffQueries = diffMetadata.manager.queries();

    let diffsStream = diffQueries.diffs();
    toJSONArray(diffsStream).pipe(res).type('application/json');
  });

  router.get('/diffs/:diffId/undocumented-urls', async (req, res) => {
    const { captureId, diffId } = req.params;
    const diffMetadata = diffs.get(diffId);
    if (!diffMetadata) {
      return res.json(404);
    }
    const diffQueries = diffMetadata.manager.queries();

    let undocumentedUrls = diffQueries.undocumentedUrls();
    toJSONArray(undocumentedUrls, {
      base: { urls: [] },
      path: 'urls',
    })
      .pipe(res)
      .type('application/json');
  });

  router.get('/diffs/:diffId/stats', async (req, res) => {
    const { captureId, diffId } = req.params;
    const diffMetadata = diffs.get(diffId);
    if (!diffMetadata) {
      return res.json(404);
    }
    const diffQueries = diffMetadata.manager.queries();

    let stats = await diffQueries.stats();
    res.json(stats);
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
