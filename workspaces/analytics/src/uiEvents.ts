import { TrackingEventBase } from './interfaces/TrackingEventBase';

type AnalyticsDispatcher = (event: TrackingEventBase<any>) => void;

export class OpticUIEvents {
  constructor(private dispatch: AnalyticsDispatcher) {}

  // in-use
  userResetDiff(currentApproved: number, totalDiffs: number) {
    this.dispatch({
      type: 'user_reset_diff',
      data: { currentApproved, totalDiffs },
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
      type: 'review_page_loaded',
      data: {
        undocumentedUrls,
        diffEngineDurationMilliseconds,
        endpointsInSpec,
      },
    });
  }

  userApprovedAll(shapeDiffs: number, newBodyDiffs: number) {
    this.dispatch({
      type: 'user_approved_all',
      data: { shapeDiffs, newBodyDiffs },
    });
  }

  userDocumentedEndpoint(isBulkMode: boolean) {
    this.dispatch({
      type: 'user_documented_endpoint',
      data: { isBulkMode },
    });
  }

  userDiscardedEndpoint() {
    this.dispatch({
      type: 'user_discarded_endpoint',
      data: {},
    });
  }

  userChoseACaptureMethod(captureSource: string) {
    this.dispatch({
      type: 'user_chose_capture_method',
      data: { captureSource },
    });
  }

  userSavedChanges(
    undocumentedUrls: number,
    endpointsChangedCount: number,
    specId: string
  ) {
    this.dispatch({
      type: 'user_saved_changes',
      data: {
        undocumentedUrls,
        endpointsChangedCount,
        specId,
      },
    });
  }

  // deprecated
}
