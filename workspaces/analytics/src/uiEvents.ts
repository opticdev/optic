import { TrackingEventBase } from './interfaces/TrackingEventBase';

type AnalyticsDispatcher = (event: TrackingEventBase<any>) => void;

export class OpticUIEvents {
  constructor(private dispatch: AnalyticsDispatcher) {}

  // in-use
  // documentation page
  documentationPageLoaded() {
    this.dispatch({
      type: 'documentation_page_loaded',
      data: {},
    });
  }

  documentationListPageLoaded() {
    this.dispatch({
      type: 'documentation_list_page_loaded',
      data: {},
    });
  }

  userSavedDocChanges(
    deletedEndpointCount: number,
    contributionChangesCount: number,
    specId: string
  ) {
    this.dispatch({
      type: 'user_saved_documentation_changes',
      data: { deletedEndpointCount, contributionChangesCount, specId },
    });
  }

  userStartedSharing() {
    this.dispatch({
      type: 'user_started_sharing',
      data: {},
    });
  }

  userPickedShareTarget(shareWith: string) {
    this.dispatch({
      type: 'user_picked_share_target',
      data: { with: shareWith },
    });
  }

  userShared(shareWith: string, publicSpecId: string) {
    this.dispatch({
      type: 'user_saved_documentation_changes',
      data: { with: shareWith, publicSpecId },
    });
  }

  userDeletedEndpoint() {
    this.dispatch({
      type: 'user_deleted_endpoint',
      data: {},
    });
  }

  // diff page
  userResetDiff(currentApproved: number, totalDiffs: number) {
    this.dispatch({
      type: 'user_reset_diff',
      data: { currentApproved, totalDiffs },
    });
  }

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

  // history page
  historyPageLoaded() {
    this.dispatch({
      type: 'history_page_loaded',
      data: {},
    });
  }

  resetToCommit(numberOfCommitsReset: number) {
    this.dispatch({
      type: 'reset_to_commit',
      data: {
        numberOfCommitsReset,
      },
    });
  }

  // Temporary
  // 2021/07/13- can remove 2021/10/13
  queryParameterDocumented(numberOfQueryParameterBodies: number) {
    this.dispatch({
      type: 'query_parameter_documented',
      data: {
        numberOfQueryParameterBodies,
      },
    });
  }

  // proposed

  // deprecated
}
