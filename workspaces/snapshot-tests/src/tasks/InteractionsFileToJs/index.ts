import * as path from 'path';
import * as fs from 'fs-extra';
import {
  ITaskExecutor,
  ITaskExecutorDependencies,
  ITaskSpecification,
  ITaskSpecificationInputs,
  TaskType,
} from '..';
import { IHttpInteraction } from '@useoptic/domain';

export interface InteractionsFileToJsTaskInputs
  extends ITaskSpecificationInputs {}

export interface InteractionsFileToJsTaskSpecification
  extends ITaskSpecification {
  type: TaskType.InteractionsFileToJsTaskSpecification;
  inputs: InteractionsFileToJsTaskInputs;
}

export type InteractionsFileToJsTaskOutput = {
  interactions: IHttpInteraction[];
};

export interface InteractionsFileToJsTaskDependencies
  extends ITaskExecutorDependencies {}

export const readInteractionsFromFile: ITaskExecutor<
  InteractionsFileToJsTaskSpecification,
  InteractionsFileToJsTaskDependencies,
  InteractionsFileToJsTaskOutput
> = async function (taskSpecification) {
  const filePath = path.join(
    'inputs',
    'interactions',
    taskSpecification.context.universe,
    taskSpecification.context.interactionsScenario
  );
  const interactions = await fs.readJson(filePath);
  return { interactions };
};
