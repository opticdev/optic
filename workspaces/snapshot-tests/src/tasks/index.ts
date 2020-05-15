import {
  buildRfcStateFromEvents,
  EventsToRfcStateTaskDependencies,
  EventsToRfcStateTaskOutput,
  EventsToRfcStateTaskSpecification,
} from './EventsToRfcState';
import {
  InteractionsFileToJsTaskDependencies,
  InteractionsFileToJsTaskOutput,
  InteractionsFileToJsTaskSpecification,
  readInteractionsFromFile,
} from './InteractionsFileToJs';
import {
  EventsFileToJsTaskDependencies,
  EventsFileToJsTaskOutput,
  EventsFileToJsTaskSpecification,
  readEventsFromFile,
} from './EventsFileToJsTaskSpecification';
import {
  buildDiffsFromRfcStateAndInteractions,
  RfcStateAndInteractionsToDiffsTaskDependencies,
  RfcStateAndInteractionsToDiffsTaskOutput,
  RfcStateAndInteractionsToDiffsTaskSpecification,
} from './RfcStateAndInteractionsToDiffs';

//@CONTRIBUTORS: here is where you would register a new task type
export enum TaskType {
  EventsFileToJsTaskSpecification = 'EventsFileToJsTaskSpecification',
  InteractionsFileToJsTaskSpecification = 'InteractionsFileToJsTaskSpecification',
  EventsToRfcStateTaskSpecification = 'EventsToRfcStateTaskSpecification',
  RfcStateAndInteractionsToDiffs = 'RfcStateAndInteractionsToDiffs',
}

export interface ITaskSpecification {
  type: TaskType;
  context: ITaskContext;
  inputs: ITaskSpecificationInputs;
}

export interface ITaskSpecificationInputs {
  [key: string]: ITaskSpecification; //@TODO: support ITaskSpecification[]?
}

export type TaskIdentifier = string;

export interface ITaskIdentifier {
  (taskSpecification: ITaskSpecification): TaskIdentifier;
}

export interface ITaskContext {
  universe: string;
  eventsScenario: string;
  interactionsScenario: string;
}

export interface ITaskExecutorOutput {}

export interface ITaskExecutorDependencies {
  [key: string]: ITaskExecutorOutput;
}

export interface ITaskExecutor<
  T extends ITaskSpecification,
  D extends ITaskExecutorDependencies,
  O extends ITaskExecutorOutput
> {
  (taskSpecification: T, dependencies: D): Promise<O>;
}

export type ITaskExecutorMap = {
  [k in TaskType]: ITaskExecutor<any, any, any>;
};

//@CONTRIBUTORS: when you add a new task type, you must document the output type of each executor and its dependencies here
export interface ExecutorMap extends ITaskExecutorMap {
  [TaskType.InteractionsFileToJsTaskSpecification]: ITaskExecutor<
    InteractionsFileToJsTaskSpecification,
    InteractionsFileToJsTaskDependencies,
    InteractionsFileToJsTaskOutput
  >;
  [TaskType.EventsFileToJsTaskSpecification]: ITaskExecutor<
    EventsFileToJsTaskSpecification,
    EventsFileToJsTaskDependencies,
    EventsFileToJsTaskOutput
  >;
  [TaskType.EventsToRfcStateTaskSpecification]: ITaskExecutor<
    EventsToRfcStateTaskSpecification,
    EventsToRfcStateTaskDependencies,
    EventsToRfcStateTaskOutput
  >;
  [TaskType.RfcStateAndInteractionsToDiffs]: ITaskExecutor<
    RfcStateAndInteractionsToDiffsTaskSpecification,
    RfcStateAndInteractionsToDiffsTaskDependencies,
    RfcStateAndInteractionsToDiffsTaskOutput
  >;
}

//@CONTRIBUTORS: when you add a new task type, you must register a new executor here
export const executors: ExecutorMap = {
  [TaskType.EventsFileToJsTaskSpecification]: readEventsFromFile,
  [TaskType.EventsToRfcStateTaskSpecification]: buildRfcStateFromEvents,
  [TaskType.InteractionsFileToJsTaskSpecification]: readInteractionsFromFile,
  [TaskType.RfcStateAndInteractionsToDiffs]: buildDiffsFromRfcStateAndInteractions,
};
