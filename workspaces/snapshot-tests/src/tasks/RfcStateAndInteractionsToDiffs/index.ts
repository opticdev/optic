import {
  ITaskExecutor,
  ITaskExecutorDependencies,
  ITaskExecutorOutput,
  ITaskSpecification,
  ITaskSpecificationInputs,
  TaskType,
} from '../';
import {
  InteractionsFileToJsTaskOutput,
  InteractionsFileToJsTaskSpecification,
} from '../InteractionsFileToJs';
import {
  EventsToRfcStateTaskOutput,
  EventsToRfcStateTaskSpecification,
} from '../EventsToRfcState';
import { diffFromRfcStateAndInteractions } from '@useoptic/domain-utilities';

export const interactionsFromFileKey = 'interactionsFromFile';
export const rfcStateFromEventsKey = 'rfcStateFromEvents';
export interface RfcStateAndInteractionsToDiffsTaskDependencies
  extends ITaskExecutorDependencies {
  [interactionsFromFileKey]: InteractionsFileToJsTaskOutput;
  [rfcStateFromEventsKey]: EventsToRfcStateTaskOutput;
}

export interface RfcStateAndInteractionsToDiffsTaskInputs
  extends ITaskSpecificationInputs {
  [interactionsFromFileKey]: InteractionsFileToJsTaskSpecification;
  [rfcStateFromEventsKey]: EventsToRfcStateTaskSpecification;
}

export interface IHttpInteractionsGroupedByDiff {}

export interface RfcStateAndInteractionsToDiffsTaskOutput
  extends ITaskExecutorOutput {
  diffs: IHttpInteractionsGroupedByDiff;
}

export interface RfcStateAndInteractionsToDiffsTaskSpecification
  extends ITaskSpecification {
  type: TaskType.RfcStateAndInteractionsToDiffs;
  inputs: RfcStateAndInteractionsToDiffsTaskInputs;
}

export const buildDiffsFromRfcStateAndInteractions: ITaskExecutor<
  RfcStateAndInteractionsToDiffsTaskSpecification,
  RfcStateAndInteractionsToDiffsTaskDependencies,
  RfcStateAndInteractionsToDiffsTaskOutput
> = function (taskSpecification, dependencies) {
  debugger;
  const rfcState = dependencies[rfcStateFromEventsKey].rfcState;
  const interactions = dependencies[interactionsFromFileKey].interactions;
  // TODO: fix me: missing shapeResolves as first argument
  // const diffs = diffFromRfcStateAndInteractions(rfcState, interactions);
  debugger;

  return Promise.resolve({
    // diffs,
    diffs: [], // TODO: remove me when def of diffs is fixed above
  });
};
