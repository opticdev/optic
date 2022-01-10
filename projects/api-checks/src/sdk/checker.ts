import {
  IChange,
  OpenApiFact,
  DocsLinkHelper,
  Result,
  runCheck,
} from '@useoptic/openapi-utilities';

export class Checker {
  private checkResults: Result[] = [];
  async runCheck(
    change: IChange<OpenApiFact>,
    docsLink: DocsLinkHelper,
    where: string,
    condition: string,
    must: boolean,
    handler: (() => void) | (() => Promise<void>)
  ) {
    this.checkResults.push(
      await runCheck(change, docsLink, where, condition, must, handler)
    );
  }

  listResults() {
    return this.checkResults;
  }
}
