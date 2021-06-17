import { developerDebugLogger, ICaptureSaver } from '../index';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import path from 'path';
import getPort from 'get-port';

class InteractionCollectorService {
  private collectorService: express.Application;
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

    await new Promise((resolve) => {
      this.collectorService.listen(servicePort, () => resolve(true));
    });

    return `http://localhost:${servicePort}/`;
  }

  //handlers
  handleEcs = async (req: express.Request, res: express.Response) => {
    const samples = req.body;
    samples.forEach((sample: any) =>
      developerDebugLogger('saw sample', sample)
    );
    //for now just save the JSON in the cwd so we can write tests on our ECS parser
    await fs.writeJson(
      path.join(process.cwd(), new Date().getUTCMilliseconds().toString()),
      samples
    );
    res.sendStatus(201);
  };
}
