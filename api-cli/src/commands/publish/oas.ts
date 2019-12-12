import {Command} from '@oclif/command'
import {spawn, SpawnOptions} from 'child_process'
// @ts-ignore
import * as colors from 'colors'
// @ts-ignore
// @ts-ignore
import {fromOptic} from '../../lib/log-helper'
import Oas from '../generate/oas'
import {processSetting, readApiConfig} from '../start'

export default class PublishOas extends Command {

  static description = 'run publish-oas command in api.yml'

  static flags = {
    // output: flags.string()
  }

  async run() {

    let config
    try {
      config = await readApiConfig()
    } catch (e) {
      return this.error('Optic Config not found. Run `api init`')
    }

    const {oas} = config.commands.publish || {}
    const publishOasCommand = oas
    if (!publishOasCommand) {
      return this.error('No command registered for `publish.oas`. Add one to your api.yml file')
    }
    const generated = await Oas.run([])

    if (generated) {
      const commandToRun = processSetting(publishOasCommand, {OAS_PATH: generated})
      const taskOptions: SpawnOptions = {
        env: {
          ...process.env,
        },
        shell: true,
        cwd: process.cwd(),
        stdio: 'inherit',
      };
      this.log(fromOptic(`Running publish command: ${colors.bold(commandToRun)}`))
      const child = spawn(commandToRun, taskOptions)

      child.on('exit', () => {
        return this.log(fromOptic('Finished running publish command'))
      });
    } else {
      this.error('Unable to generate OAS file.')
    }
  }
}
