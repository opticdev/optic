import {getPathsRelativeToCwd, readApiConfig} from '@useoptic/cli-config';
import {parseIgnore} from '@useoptic/cli-config';
import express from 'express';

import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as fs from 'fs-extra';
import {FileSystemCaptureLoader} from '../file-system-capture-loader';
import {ICaptureLoader} from '../index';
import {developerDebugLogger} from '../logger';
import {ICliServerSession} from '../server';
import * as URL from 'url';
import fetch from 'cross-fetch';
import {opticStatusPath} from '@useoptic/proxy';
import * as yaml from 'js-yaml';
import sortBy from 'lodash.sortby';
import waitOn from "wait-on";

export class CapturesHelpers {
  constructor(private basePath: string) {
  }

  async validateCaptureId(req: express.Request, res: express.Response, next: express.NextFunction) {
    const {captureId} = req.params;
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
    await fs.writeJson(exampleFilePath, currentFileContents, {spaces: 2});
  }
}


export function makeRouter(sessions: ICliServerSession[]) {


  function prepareEvents(events: any): string {
    return `[
${events.map((x: any) => JSON.stringify(x)).join('\n,')}
]`;
  }

  async function ensureValidSpecId(req: express.Request, res: express.Response, next: express.NextFunction) {
    const {specId} = req.params;
    developerDebugLogger({specId, sessions});
    const session = sessions.find(x => x.id === specId);
    if (!session) {
      res.sendStatus(404);
      return;
    }

    const paths = await getPathsRelativeToCwd(session.path);
    const {configPath, capturesPath, exampleRequestsPath} = paths;
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


  const router = express.Router({mergeParams: true});
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
  router.put('/events', bodyParser.json({limit: '100mb'}), async (req, res) => {
    const events = req.body;
    await fs.writeFile(req.optic.paths.specStorePath, prepareEvents(events));
    res.sendStatus(204);
  });

  // example requests router
  router.post('/example-requests/:requestId', bodyParser.json({limit: '100mb'}), async (req, res) => {
    const {requestId} = req.params;
    await req.optic.exampleRequestsHelpers.saveExampleRequest(requestId, req.body);
    res.sendStatus(204);
  });

  router.get('/example-requests/:requestId', async (req, res) => {
    const {requestId} = req.params;
    const currentFileContents = await req.optic.exampleRequestsHelpers.getExampleRequests(requestId);
    res.json({
      examples: currentFileContents
    });
  });

  // captures router. cli picks captureId and writes to whatever persistence method and provides capture id to ui. api spec just shows spec?
  router.get('/captures', async (req, res) => {
    const {captures} = req.optic.session;
    res.json({
      captures: sortBy(captures, i => i.taskConfig.startTime).reverse().map(i => i.taskConfig.captureId)
    });
  });
  router.put('/captures/:captureId/status', bodyParser.json({limit: '1kb'}), async (req, res) => {
    const {captureId} = req.params;
    const captureInfo = req.optic.session.captures.find(x => x.taskConfig.captureId === captureId);
    if (!captureInfo) {
      return res.sendStatus(400);
    }
    const {status} = req.body;
    if (status !== 'completed') {
      return res.sendStatus(400);
    }
    captureInfo.status = 'completed';

    res.sendStatus(204);
  });
  router.get('/captures/:captureId/samples', async (req, res) => {
    const {captureId} = req.params;
    const captureInfo = req.optic.session.captures.find(x => x.taskConfig.captureId === captureId);

    const loader: ICaptureLoader = new FileSystemCaptureLoader({
      captureBaseDirectory: req.optic.paths.capturesPath
    });
    try {
      const filter = parseIgnore(req.optic.config.ignoreRequests || []);
      const capture = await loader.loadWithFilter(captureId, filter);
      res.json({
        metadata: {
          completed: captureInfo && captureInfo.status === 'completed'
        },
        samples: capture.samples,
        links: [
          {rel: 'next', href: ''}
        ]
      });
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  });

  //config
  router.get('/config', async (req, res) => {
    res.json({config: req.optic.config, rawYaml: yaml.safeDump(req.optic.config)});
  });

  router.put('/config', bodyParser.json({limit: '2mb'}), async (req, res) => {
    await fs.writeFile(req.optic.paths.configPath, req.body.yaml);
    res.sendStatus(200);
  });


  router.get('/captures/last', async (req, res: express.Response) => {
    const capture = req.optic.session.captures[req.optic.session.captures.length - 1];
    if (!capture) {
      return res.json({
        capture: null,
        samples: 0,
        proxyRunning: false,
        serviceRunning: false
      });
    }

    const {taskConfig} = capture;
    const {captureId, proxyConfig, serviceConfig} = taskConfig;
    //proxy config
    const proxyUrl = URL.format({
      protocol: proxyConfig.protocol,
      hostname: proxyConfig.host,
      port: proxyConfig.port,
      pathname: opticStatusPath
    });

    const proxyRunning = await new Promise(((resolve) => {
      fetch(proxyUrl)
        .then(res => res.status === 200 ? resolve(true) : resolve(false)) // if proxy is on right port it will have the status endpoint
        .catch(e => resolve(false)); //if this happens, the service is running on the port instead of the proxy
    }));

    const serviceRunning = await new Promise(async (resolve) => {
      waitOn({
        resources: [
          `tcp:${serviceConfig.host}:${serviceConfig.port}`
        ],
        delay: 0,
        tcpTimeout: 250,
        window: 250
      }).then(() => resolve(true)) //if service resolves we assume it's up.
        .catch(() => resolve(false));
    });

    const loader = new FileSystemCaptureLoader({
      captureBaseDirectory: req.optic.paths.capturesPath
    });
    const filter = parseIgnore(req.optic.config.ignoreRequests || []);

    const {samples} = await loader.loadWithFilter(captureId, filter);

    res.json({
      capture,
      samples: samples.length,
      proxyRunning,
      serviceRunning
    });
  });

  return router;
}
