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
    diffsPerEndpoint: number[],
    undocumentedUrls: number,
    diffEngineDurationSeconds: number,
    totalObservations: number,
    endpointsInSpec: number
  ) {
    this.dispatch({
      name: 'review_page_loaded',
      properties: {
        diffsPerEndpoint,
        undocumentedUrls,
        diffEngineDurationSeconds,
        totalObservations,
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
    approvedEndpointDiffs: number,
    contributionsChanged: number
  ) {
    this.dispatch({
      name: 'user_saved_changes',
      properties: {
        undocumentedUrls,
        approvedEndpointDiffs,
        contributionsChanged,
      },
    });
  }

  // deprecated
}
