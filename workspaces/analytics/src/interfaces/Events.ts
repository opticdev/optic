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
  PreviewSuggestion: null,
  SuggestionAccepted: null,
  ChangesCommitted: null,
});
