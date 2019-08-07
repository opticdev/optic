import { Command, flags } from '@oclif/command'
import * as fs from 'fs-extra'
import * as clipboardy from 'clipboardy'
// @ts-ignore
import * as niceTry from 'nice-try'
import * as path from 'path'
// @ts-ignore
import cli from 'cli-ux'
import { readmePath, specStorePath, basePath, configPath, gitignorePath } from '../Paths'
import { prepareEvents } from '../PersistUtils'
import * as yaml from 'js-yaml'
import analytics from '../lib/analytics'

export interface IApiCliProxyConfig {
  target: string
  port: number
}
export interface IApiCliCommandsConfig {
  start: string
}
export interface IApiCliConfig {
  name: string
  proxy: IApiCliProxyConfig
  commands: IApiCliCommandsConfig
}

export default class Init extends Command {

  static description = 'add Optic to your API'

  static flags = {
    paste: flags.boolean({}),
  }

  static args = []

  async run() {
    const { flags } = this.parse(Init)
    if (flags.paste) {
      analytics.track('init from web')
      await this.webImport()
    } else {
      analytics.track('init blank')
      await this.blankWithName()
    }

    this.log('\n')
    this.log(`API Spec successfully added to ${basePath} !`)
    this.log(` - Run 'api start' to run your API.`)
    this.log(` - Run 'api spec' to view and edit the specification`)
  }

  async blankWithName() {
    const name = await cli.prompt('What is the name of this API?')
    const command = await cli.prompt('What command is used to start the API? (e.g. npm start)')
    const proxyTarget = await cli.prompt('API server location (e.g. http://localhost:3000)')
    const proxyPort = 30333
    this.log('Optic is setup!')
    const config: IApiCliConfig = {
      name,
      commands: {
        start: command
      },
      proxy: {
        target: proxyTarget,
        port: proxyPort
      }
    }
    const events = [
      { APINamed: { name } }
    ]
    this.createFileTree(events, config)
  }

  webImport() {
    const events = niceTry(() => {
      const clipboardContents = clipboardy.readSync()
      const parsedJson = JSON.parse(clipboardContents)
      if (Array.isArray(parsedJson) && parsedJson.every(i => typeof i === 'object')) {
        return parsedJson
      }
    })
    if (!events) {
      this.error('Website state not found in clipboard. Press "Copy State" on the webapp.')
    }
    this.createFileTree(events)
  }

  async createFileTree(events: any[], config?: IApiCliConfig) {
    const readmeContents = await fs.readFile(path.join(__dirname, '../../resources/docs-readme.md'))
    const files = [
      {
        path: gitignorePath,
        contents: `
sessions/
`
      },
      {
        path: specStorePath,
        contents: prepareEvents(events)
      },
      {
        path: readmePath,
        contents: readmeContents
      }
    ]
    if (config) {
      files.push({
        path: configPath,
        contents: yaml.safeDump(config)
      })
    }
    files.forEach(async (file) => {
      await fs.ensureFile(file.path)
      await fs.writeFile(file.path, file.contents)
    })
  }
}
