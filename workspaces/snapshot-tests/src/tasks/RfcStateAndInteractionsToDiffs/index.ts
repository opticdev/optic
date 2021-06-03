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
  EventsFileToJsTaskOutput,
  EventsFileToJsTaskSpecification,
} from '../EventsFileToJsTaskSpecification';
import * as opticEngine from '@useoptic/optic-engine-wasm';

export const interactionsFromFileKey = 'interactionsFromFile';
export const eventsFromFileKey = 'eventsFromFile';
export interface RfcStateAndInteractionsToDiffsTaskDependencies
  extends ITaskExecutorDependencies {
  [interactionsFromFileKey]: InteractionsFileToJsTaskOutput;
  [eventsFromFileKey]: EventsFileToJsTaskOutput;
}

export interface RfcStateAndInteractionsToDiffsTaskInputs
  extends ITaskSpecificationInputs {
  [interactionsFromFileKey]: InteractionsFileToJsTaskSpecification;
  [eventsFromFileKey]: EventsFileToJsTaskSpecification;
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
> = async function (taskSpecification, dependencies) {
  debugger;
  const rfcState = dependencies[eventsFromFileKey].events;
  const interactions = dependencies[interactionsFromFileKey].interactions;
  const events = dependencies[eventsFromFileKey].events;
  const spec = opticEngine.spec_from_events(JSON.stringify(events));
  const diffs = interactions.flatMap((interaction) => {
    const interactionDiffs = opticEngine.diff_interaction(
      JSON.stringify(interaction),
      spec
    );
    return JSON.parse(interactionDiffs);
  });
  return {
    diffs,
  };
};
