import { IRfcEvent } from '../EventsToRfcState';
import path from 'path';
import fs from 'fs-extra';
import {
  ITaskExecutor,
  ITaskExecutorDependencies,
  ITaskExecutorOutput,
  ITaskSpecification,
  ITaskSpecificationInputs,
  TaskType,
} from '..';

export interface EventsFileToJsTaskDependencies
  extends ITaskExecutorDependencies {}

export interface EventsFileToJsTaskInputs extends ITaskSpecificationInputs {}

export interface EventsFileToJsTaskSpecification extends ITaskSpecification {
  type: TaskType.EventsFileToJsTaskSpecification;
  inputs: EventsFileToJsTaskInputs;
}

export interface EventsFileToJsTaskOutput extends ITaskExecutorOutput {
  events: IRfcEvent[];
}

export const readEventsFromFile: ITaskExecutor<
  EventsFileToJsTaskSpecification,
  EventsFileToJsTaskDependencies,
  EventsFileToJsTaskOutput
> = async function (taskSpecification) {
  const filePath = path.join(
    'inputs',
    'events',
    taskSpecification.context.universe,
    taskSpecification.context.eventsScenario
  );
  const events = await fs.readJson(filePath);
  return { events };
};
