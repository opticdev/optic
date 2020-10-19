import express from 'express';
import bodyParser from 'body-parser';
import { IdGenerator } from '@useoptic/cli-shared';
import { CaptureId } from '@useoptic/saas-types';
import {
  IInteractionPointerConverter,
  LocalCaptureInteractionContext,
} from '@useoptic/cli-shared/build/captures/avro/file-system/interaction-iterator';
import { chain, final } from 'stream-chain';
import { stringer as jsonStringer } from 'stream-json/Stringer';
import { disassembler as jsonDisassembler } from 'stream-json/Disassembler';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { replace as jsonReplace } from 'stream-json/filters/Replace';
import { Duplex, Readable } from 'stream';
import { OnDemandInitialBody } from '../tasks/on-demand-initial-body';
import { Diff } from '../diffs';

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
    '/diffs',
    bodyParser.json({ limit: '100mb' }),
    async (req, res) => {
      const { captureId } = req.params;
      const { ignoreRequests, events, additionalCommands, filters } = req.body;

      let diffId;
      try {
        diffId = await req.optic.session.diffCapture(captureId, filters);
      } catch (e) {
        return res.status(500).json({ message: e.message });
      }

      res.json({
        diffId,
        notificationsUrl: `${req.baseUrl}/diffs/${diffId}/notifications`,
      });
    }
  );

  ////////////////////////////////////////////////////////////////////////////////
  router.post(
    '/initial-bodies',
    bodyParser.json({ limit: '100mb' }),
    async (req, res) => {
      const { captureId } = req.params;
      const { events, pathId, method } = req.body;

      const initialBodyGenerator = new OnDemandInitialBody({
        captureBaseDirectory: req.optic.paths.capturesPath,
        events: events,
        captureId,
        pathId,
        method,
      });

      const result = initialBodyGenerator.run();

      result.then((learnedBodies: ILearnedBodies) => {
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

  router.get('/diffs/:diffId/notifications', async (req, res) => {
    const { diffId } = req.params;
    const progress = req.optic.session.diffProgress(diffId);
    if (!progress) {
      return res.json(404);
    }
    const notifications = chain([
      progress,
      ({ type, data }) => {
        if (type === 'progress') type = 'message';
        return [`data: ${JSON.stringify({ type, data })}\n\n`];
      },
    ]);

    const headers = {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    };
    res.writeHead(200, headers);
    notifications.pipe(res);
  });

  ////////////////////////////////////////////////////////////////////////////////

  router.get('/diffs/:diffId/diffs', async (req, res) => {
    const { diffId } = req.params;
    const diffQueries = req.optic.session.diffQueries(diffId);

    if (!diffQueries) {
      return res.json(404);
    }

    let diffsStream = diffQueries.diffs();

    toJSONArray(diffsStream).pipe(res).type('application/json');
  });

  router.get('/diffs/:diffId/undocumented-urls', async (req, res) => {
    const { diffId } = req.params;
    const diffQueries = req.optic.session.diffQueries(diffId);

    if (!diffQueries) {
      return res.json(404);
    }

    let undocumentedUrls = diffQueries.undocumentedUrls();
    toJSONArray(undocumentedUrls, {
      base: { urls: [] },
      path: 'urls',
    })
      .pipe(res)
      .type('application/json');
  });

  router.get('/diffs/:diffId/stats', async (req, res) => {
    const { diffId } = req.params;
    const diffQueries = req.optic.session.diffQueries(diffId);

    if (!diffQueries) {
      return res.json(404);
    }

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
