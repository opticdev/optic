import { getPathsRelativeToCwd, readApiConfig } from '@useoptic/cli-config';
import { parseIgnore } from '@useoptic/cli-config';
import express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as fs from 'fs-extra';
import { FileSystemCaptureLoader } from '../captures/file-system/avro/file-system-capture-loader';
import { ICaptureLoader } from '../index';
import { developerDebugLogger } from '../logger';
import { ICliServerSession } from '../server';
import * as URL from 'url';
import fetch from 'cross-fetch';
import { opticStatusPath } from '@useoptic/proxy';
import * as yaml from 'js-yaml';
import sortBy from 'lodash.sortby';
import waitOn from 'wait-on';

export class CapturesHelpers {
  constructor(private basePath: string) {
  }

  async validateCaptureId(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { captureId } = req.params;
    const captureDirectoryPath = this.captureDirectory(captureId);
    const exists = await fs.pathExists(captureDirectoryPath);
    if (exists) {
      return next();
    } else {
      return res.sendStatus(404);
    }
  }

  captureDirectory(captureId: string) {
    return path.join(this.basePath, captureId);
  }
}

export class ExampleRequestsHelpers {
  constructor(private basePath: string) {
  }

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

  async function ensureValidSpecId(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { specId } = req.params;
    developerDebugLogger({ specId, sessions });
    const session = sessions.find(x => x.id === specId);
    if (!session) {
      res.sendStatus(404);
      return;
    }

    const paths = await getPathsRelativeToCwd(session.path);
    const { configPath, capturesPath, exampleRequestsPath } = paths;
    const config = await readApiConfig(configPath);
    const capturesHelpers = new CapturesHelpers(capturesPath);
    const exampleRequestsHelpers = new ExampleRequestsHelpers(exampleRequestsPath);
    req.optic = {
      session,
      config,
      paths,
      capturesHelpers,
      exampleRequestsHelpers
    };
    next();
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
  router.put('/events', bodyParser.json({ limit: '100mb' }), async (req, res) => {
    const events = req.body;
    await fs.writeFile(req.optic.paths.specStorePath, prepareEvents(events));
    res.sendStatus(204);
  });

  // example requests router
  router.post('/example-requests/:requestId', bodyParser.json({ limit: '100mb' }), async (req, res) => {
    const { requestId } = req.params;
    await req.optic.exampleRequestsHelpers.saveExampleRequest(requestId, req.body);
    res.sendStatus(204);
  });

  router.get('/example-requests/:requestId', async (req, res) => {
    const { requestId } = req.params;
    const currentFileContents = await req.optic.exampleRequestsHelpers.getExampleRequests(requestId);
    res.json({
      examples: currentFileContents
    });
  });

  // captures router. cli picks captureId and writes to whatever persistence method and provides capture id to ui. api spec just shows spec?
  router.get('/captures', async (req, res) => {
    const { captures } = req.optic.session;
    res.json({
      captures:
        sortBy(captures, i => i.taskConfig.startTime)
        .reverse()
        .map(i => ({captureId: i.taskConfig.captureId, lastUpdate: i.taskConfig.startTime, hasDiff: false}))
    });
  });
  router.put('/captures/:captureId/status', bodyParser.json({ limit: '1kb' }), async (req, res) => {
    const { captureId } = req.params;
    const captureInfo = req.optic.session.captures.find(x => x.taskConfig.captureId === captureId);
    if (!captureInfo) {
      return res.sendStatus(400);
    }
    const { status } = req.body;
    if (status !== 'completed') {
      return res.sendStatus(400);
    }
    captureInfo.status = 'completed';

    res.sendStatus(204);
  });
  router.get('/captures/:captureId/samples', async (req, res) => {
    const { captureId } = req.params;
    const captureInfo = req.optic.session.captures.find(x => x.taskConfig.captureId === captureId);
    if (!captureInfo) {
      return res.sendStatus(400);
    }

    const loader: ICaptureLoader = new FileSystemCaptureLoader({
      captureBaseDirectory: req.optic.paths.capturesPath
    });
    try {
      const filter = parseIgnore(req.optic.config.ignoreRequests || []);
      const capture = await loader.loadWithFilter(captureId, filter);
      res
        .header('Cache-Control', 'max-age=6000')
        .header('ETag', `"optic-etag-v1-${capture.samples.length}"`)
        .json({
          metadata: {
            completed: captureInfo.status === 'completed'
          },
          samples: capture.samples,
          links: [
            { rel: 'next', href: '' }
          ]
        });
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  });

  return router;
}
