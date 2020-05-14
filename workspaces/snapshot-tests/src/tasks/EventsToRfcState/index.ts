import {
  ITaskExecutor,
  ITaskExecutorDependencies,
  ITaskSpecification,
  ITaskSpecificationInputs,
  TaskType,
} from '..';
import { rfcStateFromEvents } from '@useoptic/domain-utilities';
import {
  EventsFileToJsTaskOutput,
  EventsFileToJsTaskSpecification,
} from '../EventsFileToJsTaskSpecification';

export interface IRfcEvent {}

const eventsFromFileKey = 'eventsFromFile';

export interface EventsToRfcStateTaskInputs extends ITaskSpecificationInputs {
  [eventsFromFileKey]: EventsFileToJsTaskSpecification;
}

export interface EventsToRfcStateTaskDependencies
  extends ITaskExecutorDependencies {
  [eventsFromFileKey]: EventsFileToJsTaskOutput;
}

export interface EventsToRfcStateTaskSpecification extends ITaskSpecification {
  type: TaskType.EventsToRfcStateTaskSpecification;
  inputs: EventsToRfcStateTaskInputs;
}

export interface EventsToRfcStateTaskOutput {
  rfcState: IRfcState;
}

export interface IRfcState {}

export const buildRfcStateFromEvents: ITaskExecutor<
  EventsToRfcStateTaskSpecification,
  EventsToRfcStateTaskDependencies,
  EventsToRfcStateTaskOutput
> = function (task, dependencies) {
  console.log('fak');
  console.log(dependencies[eventsFromFileKey].events);
  const rfcState = rfcStateFromEvents(dependencies[eventsFromFileKey].events);
  return Promise.resolve({ rfcState });
};
