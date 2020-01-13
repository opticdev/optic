import {IApiCliConfig, IOpticTask} from '../commands/init'
import {TaskToStartConfig} from './task-to-start-config'
import * as colors from 'colors'

export async function runTask(config: IApiCliConfig, taskName: string): Promise<void> {
  const task = config.tasks[taskName]
  if (!task) {
    return console.log(colors.red(`No task ${colors.bold(taskName)} found in optic.yml`))
  }

  const startConfig = await TaskToStartConfig(task)

  console.log('starting....' + JSON.stringify(startConfig))

  return
}
