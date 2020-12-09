import { IApiCliConfig } from '../index';
import { buildTask } from './initial-task';

export function patchInitialTaskOpticYaml(
  current: IApiCliConfig,
  newInitialTaskName: string,
  newInitialTaskFlags: any
) {
  return buildTask(current.name, newInitialTaskFlags, newInitialTaskName);
}
