import { ApiTraffic, TrafficSource } from '../types';
import { waitFor } from '../../../utils/debug_waitFor';
import fs from 'fs-extra';
import { OpticHttpInteraction } from '../traffic/optic-http-interaction';

export class DebugSource extends TrafficSource {
  constructor(private examples: ApiTraffic[], private pauseFor: number) {
    super();
  }

  start(): Promise<void> {
    setTimeout(() => {
      this.examples.forEach(async (i) => {
        await this.emitTraffic(i);
        await waitFor(this.pauseFor);
      });
    }, 50);
    return Promise.resolve(undefined);
  }

  stop(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export class OpticOssDebugCaptureSource extends TrafficSource {
  constructor(private filePath: string, private pauseFor: number) {
    super();
  }

  async start(): Promise<void> {
    const debugCapture = await fs.readJson(this.filePath);

    await waitFor(50);

    for (let interaction of debugCapture) {
      const interactionInstance = new OpticHttpInteraction(interaction);
      await this.emitTraffic(interactionInstance);
      await waitFor(this.pauseFor);
    }

    return Promise.resolve(undefined);
  }

  stop(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
