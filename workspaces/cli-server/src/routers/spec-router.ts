import {
  getPathsRelativeToCwd,
  IOpticTaskRunnerConfig,
  parseIgnore,
  readApiConfig,
  readTestingConfig,
} from '@useoptic/cli-config';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs-extra';
import { ICliServerSession } from '../server';
import sortBy from 'lodash.sortby';
import {
  DefaultIdGenerator,
  developerDebugLogger,
  FileSystemAvroCaptureLoader,
  ICaptureLoader,
} from '@useoptic/cli-shared';
import { makeRouter as makeCaptureRouter } from './capture-router';
import { LocalCaptureInteractionPointerConverter } from '@useoptic/cli-shared/build/captures/avro/file-system/interaction-iterator';
type CaptureId = string;
type Iso8601Timestamp = string;
export type InvalidCaptureState = {
  captureId: CaptureId;
  status: 'unknown';
};

export function isValidCaptureState(x: CaptureState): x is ValidCaptureState {
  return x.status === 'started' || x.status === 'completed';
}

export type ValidCaptureState = {
  captureId: CaptureId;
  status: 'started' | 'completed';
  metadata: {
    taskConfig: IOpticTaskRunnerConfig;
    startedAt: Iso8601Timestamp;
    lastInteraction: {
      count: number;
      observedAt: Iso8601Timestamp;
    } | null;
  };
};
export type CaptureState = InvalidCaptureState | ValidCaptureState;

const captureStateFileName = 'optic-capture-state.json';

export class CapturesHelpers {
  constructor(private basePath: string) {}

  async validateCaptureId(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const { captureId } = req.params;
    const captureDirectoryPath = this.captureDirectory(captureId);
    const exists = await fs.pathExists(captureDirectoryPath);
    if (exists) {
      return next();
    } else {
      return res.sendStatus(404);
    }
  }

  async listCaptureIds(): Promise<CaptureId[]> {
    const captureIds = await fs.readdir(this.basePath);
    return captureIds;
  }

  async loadCaptureState(captureId: CaptureId): Promise<CaptureState> {
    const stateFilePath = this.stateFile(captureId);
    const stateFileExists = await fs.pathExists(stateFilePath);
    if (!stateFileExists) {
      return {
        captureId,
        status: 'unknown',
      };
    }
    const state = await fs.readJson(stateFilePath);
    return state;
  }

  async updateCaptureState(state: CaptureState): Promise<void> {
    await fs.ensureDir(this.captureDirectory(state.captureId));
    const stateFilePath = this.stateFile(state.captureId);
    await fs.writeJson(stateFilePath, state);
  }

  async listCapturesState(): Promise<CaptureState[]> {
    const captureIds = await this.listCaptureIds();
    const promises = captureIds.map((captureId) => {
      return this.loadCaptureState(captureId);
    });
    const capturesState = await Promise.all(promises);
    return capturesState.filter((x) => x !== null);
  }

  async loadCaptureSummary(captureId: CaptureId) {
    const captureDirectory = this.captureDirectory(captureId);
    const files = await fs.readdir(captureDirectory);
    const interactions = files.filter((x) => x.startsWith('interactions-'));
    const promises = interactions.map((x) => {
      return fs.readJson(path.join(captureDirectory, x));
    });
    const summaries = await Promise.all(promises);
    const summary = summaries.reduce(
      (acc, value) => {
        acc.diffsCount = acc.diffsCount + value.diffsCount;
        acc.interactionsCount = acc.interactionsCount + value.interactionsCount;
        return acc;
      },
      { diffsCount: 0, interactionsCount: 0 }
    );
    return summary;
  }

  stateFile(captureId: CaptureId): string {
    return path.join(this.captureDirectory(captureId), captureStateFileName);
  }

  captureDirectory(captureId: CaptureId): string {
    return path.join(this.basePath, captureId);
  }
}

export class ExampleRequestsHelpers {
  constructor(private basePath: string) {}

  exampleFile(requestId: string) {
    return path.join(this.basePath, requestId, 'examples.json');
  }

  async getExampleRequests(requestId: string): Promise<any> {
    const exampleFilePath = this.exampleFile(requestId);
    const currentFileContents = await (async () => {
      const exists = await fs.pathExists(exampleFilePath);
      if (exists) {
        try {
          const contents = await fs.readJson(exampleFilePath);
          return contents;
        } catch (e) {
          return [];
        }
      }
      return [];
    })();
    return currentFileContents;
  }

  async saveExampleRequest(requestId: string, example: any) {
    const exampleFilePath = this.exampleFile(requestId);
    const currentFileContents = await this.getExampleRequests(requestId);
    currentFileContents.push(example);
    await fs.ensureFile(exampleFilePath);
    await fs.writeJson(exampleFilePath, currentFileContents, { spaces: 2 });
  }
}

export function makeRouter(sessions: ICliServerSession[]) {
  function prepareEvents(events: any): string {
    return `[
${events.map((x: any) => JSON.stringify(x)).join('\n,')}
]`;
  }

  async function ensureValidSpecId(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const { specId } = req.params;
    developerDebugLogger({ specId, sessions });
    const session = sessions.find((x) => x.id === specId);
    if (!session) {
      res.sendStatus(404);
      return;
    }
    try {
      const paths = await getPathsRelativeToCwd(session.path);
      const { configPath, capturesPath, exampleRequestsPath } = paths;
      const config = await readApiConfig(configPath);
      const capturesHelpers = new CapturesHelpers(capturesPath);
      const exampleRequestsHelpers = new ExampleRequestsHelpers(
        exampleRequestsPath
      );
      req.optic = {
        config,
        paths,
        capturesHelpers,
        exampleRequestsHelpers,
      };
      next();
    } catch (e) {
      res.status(500).json({
        message: e.message,
      });
    }
  }

  const router = express.Router({ mergeParams: true });
  router.use(ensureValidSpecId);

  // events router
  router.get('/events', async (req, res) => {
    try {
      const events = await fs.readJson(req.optic.paths.specStorePath);
      res.json(events);
    } catch (e) {
      res.json([]);
    }
  });
  router.put(
    '/events',
    bodyParser.json({ limit: '100mb' }),
    async (req, res) => {
      const events = req.body;
      await fs.writeFile(req.optic.paths.specStorePath, prepareEvents(events));
      res.sendStatus(204);
    }
  );

  // example requests router
  router.post(
    '/example-requests/:requestId',
    bodyParser.json({ limit: '100mb' }),
    async (req, res) => {
      const { requestId } = req.params;
      await req.optic.exampleRequestsHelpers.saveExampleRequest(
        requestId,
        req.body
      );
      res.sendStatus(204);
    }
  );

  router.get('/example-requests/:requestId', async (req, res) => {
    const { requestId } = req.params;
    const currentFileContents = await req.optic.exampleRequestsHelpers.getExampleRequests(
      requestId
    );
    res.json({
      examples: currentFileContents,
    });
  });

  // captures router. cli picks captureId and writes to whatever persistence method and provides capture id to ui. api spec just shows spec?
  router.get('/captures', async (req, res) => {
    const captures = await req.optic.capturesHelpers.listCapturesState();
    const validCaptures: ValidCaptureState[] = captures.filter((x) =>
      isValidCaptureState(x)
    ) as ValidCaptureState[];
    res.json({
      captures: sortBy(validCaptures, (i) => i.metadata.startedAt)
        .reverse()
        .map((i) => ({
          captureId: i.captureId,
          status: i.status,
          lastUpdate: i.metadata.lastInteraction
            ? i.metadata.lastInteraction.observedAt
            : i.metadata.startedAt,
          links: [
            {
              rel: 'samples',
              href: `${req.baseUrl}/captures/${i.captureId}/samples`,
            },
            {
              rel: 'status',
              href: `${req.baseUrl}/captures/${i.captureId}/status`,
            },
          ],
        })),
    });
  });

  router.get('/config', async (req, res) => {
    res.json({
      config: req.optic.config,
    });
  });

  const captureRouter = makeCaptureRouter({
    idGenerator: new DefaultIdGenerator(),
    interactionPointerConverterFactory: (config: {
      captureId: CaptureId;
      captureBaseDirectory: string;
    }) => new LocalCaptureInteractionPointerConverter(config),
  });
  router.use('/captures/:captureId', captureRouter);

  router.get('/captures/:captureId/samples', async (req, res) => {
    const { captureId } = req.params;

    const loader: ICaptureLoader = new FileSystemAvroCaptureLoader({
      captureId,
      captureBaseDirectory: req.optic.paths.capturesPath,
    });
    try {
      const filter = parseIgnore(req.optic.config.ignoreRequests || []);
      const capture = await loader.loadWithFilter(filter);
      res.json({
        metadata: {},
        samples: capture.samples,
        links: [{ rel: 'next', href: '' }],
      });
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  });

  router.get('/testing-credentials', async (req, res) => {
    const { paths } = req.optic;
    if (!(await fs.pathExists(paths.testingConfigPath))) {
      return res.sendStatus(404);
    }

    try {
      const testingConfig = await readTestingConfig(paths.testingConfigPath);

      return res.json({
        authToken: testingConfig.authToken,
      });
    } catch (e) {
      console.error(e);
      return res.sendStatus(500);
    }
  });

  return router;
}
