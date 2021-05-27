import { CheckAssertionsResult } from './interfaces/ApiCheck';
import { TrackingEventBase } from './interfaces/TrackingEventBase';

export enum EventsEnum {
  // Onboarding
  UserLoggedInFromCLI = 'UserLoggedInFromCLI',
  ApiInitializedInProject = 'ApiInitializedInProject',
  ApiCheckCompleted = 'ApiCheckCompleted',

  // running tasks
  StartedTaskWithLocalCli = 'StartedTaskWithLocalCli',
  ExitedTaskWithLocalCli = 'ExitedTaskWithLocalCli',

  StatusRun = 'StatusRun',
  LiveTrafficIngestedWithLocalCli = 'LiveTrafficIngestedWithLocalCli',
}

type UserLoggedInFromCLIProps = {
  userId: string;
};

export const UserLoggedInFromCLI = (
  data: UserLoggedInFromCLIProps
): TrackingEventBase<UserLoggedInFromCLIProps> => ({
  type: EventsEnum.UserLoggedInFromCLI,
  data,
});

type ApiInitializedInProjectProps = {
  apiName: string;
  source: string;
  cwd: string;
};

export const ApiInitializedInProject = (
  data: ApiInitializedInProjectProps
): TrackingEventBase<ApiInitializedInProjectProps> => ({
  type: EventsEnum.ApiInitializedInProject,
  data,
});

export const ApiCheckCompleted = (
  data: CheckAssertionsResult
): TrackingEventBase<CheckAssertionsResult> => ({
  type: EventsEnum.ApiCheckCompleted,
  data,
});

type StartedTaskWithLocalCliProps = {
  captureId: string;
  cwd: string;
  inputs: {
    task: string;
  } & Record<string, string>;
};

export const StartedTaskWithLocalCli = (
  data: StartedTaskWithLocalCliProps
): TrackingEventBase<StartedTaskWithLocalCliProps> => ({
  type: EventsEnum.StartedTaskWithLocalCli,
  data,
});

type ExitedTaskWithLocalCliProps = {
  interactionCount: number;
  captureId: string;
  inputs: {
    task: string;
  } & Record<string, string>;
};

export const ExitedTaskWithLocalCli = (
  data: ExitedTaskWithLocalCliProps
): TrackingEventBase<ExitedTaskWithLocalCliProps> => ({
  type: EventsEnum.StartedTaskWithLocalCli,
  data,
});

type StatusRunProps = {
  captureId: string;
  diffCount: number;
  undocumentedCount: number;
  timeMs: number;
};

export const StatusRun = (
  data: StatusRunProps
): TrackingEventBase<StatusRunProps> => ({
  type: EventsEnum.StatusRun,
  data,
});

type LiveTrafficIngestedWithLocalCliProps = {
  captureId: string;
  interactionCount: number;
};

export const LiveTrafficIngestedWithLocalCli = (
  data: LiveTrafficIngestedWithLocalCliProps
): TrackingEventBase<LiveTrafficIngestedWithLocalCliProps> => ({
  type: EventsEnum.StatusRun,
  data,
});
