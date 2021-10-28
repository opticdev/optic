import { Result, runCheck } from "./types";

export class Checker {
  private checkResults: Result[] = [];
  async runCheck(
    where: string,
    condition: string,
    must: boolean,
    handler: (() => void) | (() => Promise<void>)
  ) {
    this.checkResults.push(await runCheck(where, condition, must, handler));
  }

  listResults() {
    return this.checkResults;
  }
}
