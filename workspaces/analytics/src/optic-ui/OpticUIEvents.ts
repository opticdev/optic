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

  // proposed
  reviewPageLoaded(
    diffs: number,
    undocumentedUrls: number,
    diffEngineDurationMilliseconds: number,
    endpointsInSpec: number
  ) {
    this.dispatch({
      name: 'review_page_loaded',
      properties: {
        undocumentedUrls,
        diffEngineDurationMilliseconds,
        endpointsInSpec,
      },
    });
  }

  userApprovedAll(shapeDiffs: number, newBodyDiffs: number) {
    this.dispatch({
      name: 'user_approved_all',
      properties: { shapeDiffs, newBodyDiffs },
    });
  }

  userDocumentedEndpoint(isBulkMode: boolean) {
    this.dispatch({
      name: 'user_documented_endpoint',
      properties: { isBulkMode },
    });
  }

  userDiscardedEndpoint() {
    this.dispatch({
      name: 'user_discarded_endpoint',
      properties: {},
    });
  }

  // userDocumentedDiff(
  //   valuesPresented: [],
  //   isIgnored: boolean,
  //   bugReportCreated: boolean
  // ) {
  //   this.dispatch({
  //     name: 'user_documented_diff',
  //     properties: { valuesPresented, isIgnored, bugReportCreated },
  //   });
  // }

  userSavedChanges(
    undocumentedUrls: number,
    endpointsChangedCount: number,
    isFirstChange: boolean,
    specId: string
  ) {
    this.dispatch({
      name: 'user_saved_changes',
      properties: {
        undocumentedUrls,
        endpointsChangedCount,
        isFirstChange,
        specId,
      },
    });
  }

  // deprecated
}
