import {
  IChange,
  OpenApiFact,
  DocsLinkHelper,
  Result,
} from '@useoptic/openapi-utilities';
import { runCheck } from '../utils';

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
