import {
  ShapeDiffAffordancesWorker,
  ShapeDiffAffordancesConfig,
  ShapeDiffAffordances,
} from '@useoptic/cli-shared/build/diffs/trail-values-worker-rust';

export { ShapeDiffAffordances };

export class OnDemandShapeDiffAffordancesRust {
  private worker: ShapeDiffAffordancesWorker;

  constructor(config: ShapeDiffAffordancesConfig) {
    this.worker = new ShapeDiffAffordancesWorker(config);
  }

  async run(): Promise<{ [fingerprint: string]: ShapeDiffAffordances }> {
    return this.worker.run();
  }
}
