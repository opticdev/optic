import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

import { TrafficSource } from '../types';
import { OpticHttpInteraction } from '../traffic/optic-http-interaction';

export type SnifferConfig = {
  interface: string;
  port: number;
};

export class SnifferSource extends TrafficSource {
  private capture: ChildProcessWithoutNullStreams;

  constructor(private config: SnifferConfig) {
    super();
  }

  async start(): Promise<void> {
    // if (captureToolNotFound...) {}
    // throw BOOM
    /*
      ray's magic

     */
    // this.emitTraffic()

    // TODO: Actually check that we can run the command
    const capture_binary_path = process.env['CAPTURE_PATH'] || 'optic_capture';
    this.capture = spawn('sudo', [
      capture_binary_path,
      'sniff',
      `:${this.config.port}`,
      '--interface',
      `${this.config.interface}`,
      'output',
      'stdout',
    ]);

    this.capture.on('error', (err: any) => {
      throw `Cannot start optic_capture ${err}`;
    });

    this.capture.on('error', (code: number, signal: any) => {
      if (code != 0) {
        throw `Capture exited with code ${code}`;
      }
    });

    var startupOk = new Promise<void>((resolve) => {
      this.capture.stderr.on('data', (data: any) => {
        //console.log("%s", data);
        resolve();
      });

      this.capture.stdout.on('data', async (data: string) => {
        resolve();
        //console.log("%s", data);
        await this.emitTraffic(new OpticHttpInteraction(JSON.parse(data)));
      });
    });
    await startupOk;
  }

  async stop(): Promise<void> {
    await this.capture.kill('SIGTERM');
  }
}
