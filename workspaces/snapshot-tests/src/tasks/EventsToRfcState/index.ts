import {
  ITaskExecutor,
  ITaskExecutorDependencies,
  ITaskSpecification,
  ITaskSpecificationInputs,
  TaskType,
} from '..';
import * as opticEngine from '@useoptic/optic-engine-wasm';
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
  shapesProjection: IShapesProjection;
}

export interface IShapesProjection {}

export const buildRfcStateFromEvents: ITaskExecutor<
  EventsToRfcStateTaskSpecification,
  EventsToRfcStateTaskDependencies,
  EventsToRfcStateTaskOutput
> = async function (task, dependencies) {
  const events = dependencies[eventsFromFileKey].events;
  const spec = opticEngine.spec_from_events(JSON.stringify(events));
  const shapesProjection = JSON.parse(opticEngine.get_shapes_projection(spec));
  return Promise.resolve({ shapesProjection });
};
