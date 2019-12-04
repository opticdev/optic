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

export interface IApiCliProxyConfig {
  target: string
  port: number
}

export interface IApiCliCommandsConfig {
  start: string,
  'publish-oas'?: string
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
    import: flags.string(),
    name: flags.string(),
    port: flags.string(),
    host: flags.string(),
    command: flags.string(),
  }

  static args = []

  async run() {
    const {flags} = this.parse(Init)
    if (flags.paste) {
      analytics.track('init from web')
      trackSlack('init from web')
      await this.webImport()
    } else if (flags.import) {
      trackSlack('init from oas')
      analytics.track('init from local oas')
      await this.importOas(flags.import)
    } else {
      const name = await cli.prompt('API Name')
      const port = await cli.prompt('Port')
      const command = await cli.prompt('Command to Start API (see table on docs page)')
      const host = 'localhost'
      await this.blankWithName(name, parseInt(port, 10), command.split('\n')[0], host)
    }
    // @ts-ignore
    const {basePath} = await getPaths()
    this.log('\n')
    this.log(`API Spec successfully added to ${basePath} !`)
    this.log(" - Run 'api start' to run your API.")
    this.log(" - Run 'api spec' to view and edit the specification")
  }

  async blankWithName(name: string, port: number, command: string, host: string) {
    const config: IApiCliConfig = {
      name,
      commands: {
        start: command
      },
      proxy: {
        // tslint:disable-next-line:no-invalid-template-strings
        target: `http://${host}:{{ENV.OPTIC_API_PORT}}`,
        port
      }
    }
    const events = [
      {APINamed: {name}}
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
    // @ts-ignore
    const {readmePath, specStorePath, configPath, gitignorePath} = await getPaths()
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
    files.forEach(async file => {
      await fs.ensureFile(file.path)
      await fs.writeFile(file.path, file.contents)
    })
    const {sessionsPath} = await getPaths()
    await fs.ensureDir(sessionsPath)
  }

  async importOas(oasFilePath: string) {

    const absolutePath = path.resolve(oasFilePath)
    const fileContents = niceTry(() => fs.readFileSync(absolutePath).toString())
    if (!fileContents) {
      return this.error(`No OpenAPI file found at ${absolutePath}`)
    }

    cli.action.start('Parsing OpenAPI file (this takes a few seconds)')

    // @ts-ignore
    const response = await fetch('https://ayiz1s0f8f.execute-api.us-east-2.amazonaws.com/production/oas/coversion/events', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({fileContents})
    })

    cli.action.stop()

    if (response.status === 200) {
      const events = await response.json()
      return this.createFileTree(events)
    } else {
      return this.error('OAS parse error' + await response.text())
    }

  }
}
