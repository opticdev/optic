import { developerDebugLogger, ICaptureSaver } from '../index';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import path from 'path';
import getPort from 'get-port';
import http from 'http';

export class InteractionCollectorService {
  private collectorService: express.Application;
  private server: http.Server | undefined;
  constructor(private captureSaver: ICaptureSaver) {
    this.collectorService = express();
    this.collectorService.use(bodyParser.json({ limit: '20mb' }));
    //https://www.elastic.co/guide/en/ecs/current/index.html
    this.collectorService.post('/ecs', this.handleEcs);
  }

  async start(): Promise<string> {
    const servicePort: number = await getPort({
      port: getPort.makeRange(3700, 3900),
    });

    this.server = await new Promise<http.Server>((resolve) => {
      const server: http.Server = this.collectorService.listen(servicePort);
      server.on('listening', () => resolve(server));
    });

    return `http://localhost:${servicePort}/`;
  }

  async stop() {
    if (this.server) {
      this.server.close();
      this.server = undefined;
    }
  }

  //handlers
  handleEcs = async (req: express.Request, res: express.Response) => {
    const samples = req.body;
    samples.forEach((sample: any) =>
      developerDebugLogger('saw sample', sample)
    );
    //for now just save the JSON in the cwd so we can write tests on our ECS parser
    await fs.writeJson(
      path.join(process.cwd(), Date.now().toString() + '.json'),
      samples
    );
    res.sendStatus(201);
  };
}
