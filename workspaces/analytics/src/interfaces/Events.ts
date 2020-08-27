//@ts-ignore
import keymirror from 'keymirror';
export const Events = keymirror({
  //on-boarding
  ApiCreated: null,
  ApiInitializedInProject: null,
  ApiCheckCompleted: null,

  //Errors
  JavascriptErrorDetectedInFrontend: null,
  RequirementForDiffsToHaveASuggestionFailed: null,

  //running tasks
  StartedTaskWithLocalCli: null,
  ExitedTaskWithLocalCli: null,

  //diffs
  BodyDiffRendered: null,
  UserChangedCaptureOverviewTab: null,
  UserEnabledInferPolymorphism: null,
  UserBeganAddingNewUrl: null,
  UserFinishedAddingNewUrl: null,
  UserResetDiff: null,
  UserPreviewedSuggestion: null,
  UserAcceptedSuggestion: null,
  UserCommittedChanges: null,
});
