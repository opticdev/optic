import { IOpticAnalyticsEvent } from '../interfaces';

type AnalyticsDispatcher = (event: IOpticAnalyticsEvent) => void;

export class OpticUIEvents {
  constructor(private dispatch: AnalyticsDispatcher) {}

  // in-use
  userResetDiff(currentApproved: number, totalDiffs: number) {
    this.dispatch({
      name: 'user_reset_diff',
      properties: { currentApproved, totalDiffs },
    });
  }

  // deprecated
}
