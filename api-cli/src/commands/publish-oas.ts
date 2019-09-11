import { Command, flags } from '@oclif/command'
import * as fs from 'fs-extra'
import * as clipboardy from 'clipboardy'
// @ts-ignore
import * as niceTry from 'nice-try'
import * as path from 'path'
// @ts-ignore
import cli from 'cli-ux'
// @ts-ignore
import * as fetch from 'node-fetch'
import {fromOptic} from '../lib/log-helper'
import * as colors from 'colors'
import Generate from './generate'
import {exec, spawn, SpawnOptions} from 'child_process'
import Init from './init'
import {processSetting, readApiConfig} from './start'

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

    const publishOasCommand = config.commands['publish-oas']
    if (!publishOasCommand) {
      return this.error('No command registered for `publish-oas`. Add one to your api.yml file')
    }

    const generated = await Generate.run(['oas'])
    if (generated) {
      console.log(generated)
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
