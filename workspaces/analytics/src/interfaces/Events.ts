//@ts-ignore
import keymirror from 'keymirror';
export const Events = keymirror({
  //on-boarding
  ApiCreated: null,
  ApiCheckCompleted: null,

  //Errors
  JavascriptErrorDetectedInFrontend: null,
  RequirementForDiffsToHaveASuggestionFailed: null,

  //running tasks
  StartedTaskWithLocalCLI: null,
  ExitedTaskWithLocalCLI: null,

  //diffs
  UserChangedCaptureOverviewTab: null,
  NewBodyDiffRendered: null,
  InferPolymorphismEnabled: null,
  UserBeganAddingNewUrl: null,
  UserFinishedAddingNewUrl: null,
  DiffWasReset: null,
  DisplayNextSuggestion: null,
  PreviewSuggestion: null,
  SuggestionAccepted: null,
  ShowCommitCard: null,
  ChangesCommitted: null,
  AddUrlModalNaming: null,
  AddUrlModalIdentifyingPathComponents: null,
  ShowInitialDocumentingView: null,
  UpdateContribution: null,
});
