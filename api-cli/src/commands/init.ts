import {Command, flags} from '@oclif/command'
import * as fs from 'fs-extra'
import * as clipboardy from 'clipboardy'
// @ts-ignore
import * as niceTry from 'nice-try'
import * as path from 'path'
import * as colors from 'colors'
// @ts-ignore
import cli from 'cli-ux'
// @ts-ignore
import * as fetch from 'node-fetch'
import {getPaths} from '../Paths'
import {prepareEvents} from '../PersistUtils'
import * as yaml from 'js-yaml'
import analytics, {trackSlack} from '../lib/analytics'
import * as open from 'open'

export interface IOpticTask {
  command: string,
  baseUrl: string
  proxy?: string
}

export interface IApiCliConfig {
  name: string
  tasks: {
    [key: string]: IOpticTask
  }
}

export default class Init extends Command {

  static description = 'Add Optic to your API'

  static flags = {}

  static args = []

  async run() {
    const cwd = process.cwd()
    const isCurrentDirectory = await cli.confirm(`${colors.bold.blue(cwd)}\nIs this your API's root directory? (yes/no)`)

    if (isCurrentDirectory) {
      const config: IApiCliConfig = {
        name: 'New API',
        tasks: {
          start: {
            command: 'echo "Setup A Valid Command to Start your API!"',
            baseUrl: 'http://localhost:3000'
          }
        }
      }
      this.createFileTree(config)
    } else {
      return this.log(colors.red(`Optic must be initialized in your API's root directory. Navigate there and then run ${colors.bold('api init')} again`))
    }
  }

  // async blankWithName(name: string, port: number, command: string, host: string) {
  //   const config: IApiCliConfig = {
  //     name,
  //     commands: {
  //       start: command
  //     },
  //     proxy: {
  //       // tslint:disable-next-line:no-invalid-template-strings
  //       target: `http://${host}:{{ENV.OPTIC_API_PORT}}`,
  //       port
  //     }
  //   }
  //   const events = [
  //     {
  //       APINamed: {
  //         eventContext: {
  //           clientCommandBatchId: 'api-init',
  //           clientId: 'anonymous',
  //           clientSessionId: '0',
  //           createdAt: new Date().toString()
  //         },
  //         name
  //       }
  //     }
  //   ]
  //   this.createFileTree(events, config)
  // }
  //

  async createFileTree(config: IApiCliConfig) {
    const {specStorePath, configPath, gitignorePath} = await getPaths()
    const files = [
      {
        path: gitignorePath,
        contents: `
sessions/
`
      },
      {
        path: specStorePath,
        contents: prepareEvents([])
      },
    ]
    if (config) {
      files.push({
        path: configPath,
        contents: yaml.safeDump(config)
      })
    }
    files.forEach(async file => {
      await fs.ensureFile(file.path)
      await fs.writeFile(file.path, file.contents)
    })
    const {captures} = await getPaths()
    await fs.ensureDir(captures)
  }

}
