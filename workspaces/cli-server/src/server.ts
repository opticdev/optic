import {IApiCliConfig, IOpticTaskRunnerConfig, IPathMapping} from '@useoptic/cli-config';
import {EventEmitter} from 'events';
import express from 'express';
import getPort from 'get-port';
import bodyParser from 'body-parser';
import * as http from 'http';
import * as path from 'path';
import fetch from 'cross-fetch'
import * as URL from 'url'
import {CapturesHelpers, ExampleRequestsHelpers, makeRouter} from './routers/spec-router';

export interface ICliServerConfig {
  jwtSecret: string
}

export interface IOpticExpressRequestAdditions {
  session: ICliServerSession
  paths: IPathMapping
  config: IApiCliConfig
  capturesHelpers: CapturesHelpers
  exampleRequestsHelpers: ExampleRequestsHelpers
}

declare global {
  namespace Express {
    export interface Request {
      optic: IOpticExpressRequestAdditions
    }
  }
}

export interface ICliServerSession {
  id: string
  path: string,
  captures: IOpticTaskRunnerConfig[]
}

export const shutdownRequested = 'cli-server:shutdown-requested';

class CliServer {
  private server!: http.Server;
  public events: EventEmitter = new EventEmitter();

  constructor(private config: ICliServerConfig) {
  }

  addUiServer(app: express.Application) {
    const resourceRoot = path.resolve(__dirname, '../resources');
    const reactRoot = path.join(resourceRoot, 'ui');
    const indexHtmlPath = path.join(reactRoot, 'index.html');
    app.use(express.static(reactRoot));
    app.get('*', (req, res) => {
      res.sendFile(indexHtmlPath);
    });
  }

  makeServer() {
    const app = express();
    const sessions: ICliServerSession[] = [];

    // @REFACTOR sessionsRouter
    app.get('/api/sessions', (req, res: express.Response) => {
      res.json({
        sessions
      });
    });
    app.post('/api/sessions', bodyParser.json({limit: '5kb'}), async (req, res: express.Response) => {
      const {path, captureId, taskConfig} = req.body;

      const existingSession = sessions.find(x => x.path === path);
      if (existingSession) {
        existingSession.captures.push(taskConfig);
        return res.json({
          session: existingSession
        });
      }

      const sessionId = (sessions.length + 1).toString();
      const session: ICliServerSession = {
        id: sessionId,
        path,
        captures: [taskConfig]
      };
      sessions.push(session);

      return res.json({
        session
      });
    });

    // @REFACTOR adminRouter
    app.post('/admin-api/commands', bodyParser.json({limit: '1kb'}), async (req, res) => {
      const {body} = req;

      if (body.type === 'shutdown') {
        res.sendStatus(204);
        this.events.emit(shutdownRequested);
        return;
      }

      res.sendStatus(400);
    });

    // specRouter
    const specRouter = makeRouter(sessions);
    app.use('/api/specs/:specId', specRouter);

    // ui
    this.addUiServer(app);

    return app;
  }

  async start(): Promise<{ port: number }> {
    const app = this.makeServer();
    const port = await getPort({
      port: [34444]
    });
    return new Promise((resolve, reject) => {
      this.server = app.listen(port, () => {
        resolve({
          port
        });
      });
    });
  }

  async stop() {
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close((err) => {
          if (err) {
            console.error(err);
          }
          resolve();
        });
      });
    }
  }
}

export {
  CliServer
};
