import { Command, flags } from '@oclif/command'
import * as fs from 'fs-extra'
import * as clipboardy from 'clipboardy'
// @ts-ignore
import * as niceTry from 'nice-try'
import * as path from 'path'
import * as colors from 'colors'
// @ts-ignore
import cli from 'cli-ux'
import * as fetch from 'node-fetch'
import { getPaths } from '../Paths'
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
    import: flags.string(),
  }

  static args = []

  async run() {
    const { flags } = this.parse(Init)
    if (flags.paste) {
      analytics.track('init from web')
      await this.webImport()
    } else if (flags.import) {
      analytics.track('init from local oas')
      await this.importOas(flags.import)
    } else {
      analytics.track('init blank')
      await this.blankWithName()
    }
    const {basePath} = await getPaths()

    this.log('\n')
    this.log(`API Spec successfully added to ${basePath} !`)
    this.log(` - Run 'api start' to run your API.`)
    this.log(` - Run 'api spec' to view and edit the specification`)
  }

  async blankWithName() {

    this.log(colors.bold(colors.blue(' \nSetup continuous documentation for your API:\n')))

    const name = await cli.prompt('What is the name of this API?')
    analytics.track('init setup name', {name})
    const port = await cli.prompt('What port does your API run on locally? (e.g. 3000)')
    analytics.track('runs on', 3000)
    const command = await cli.prompt('What command is used to start the API? (e.g npm start)')
    analytics.track('uses command', command)
    this.log(colors.bold(colors.blue(' \nAlmost there! You need to make one small code change:')))
    this.log(`Now you have to change the port your API listens on to the one Optic assigns it.`)
    this.log(`Your API will still be accessible on port ${port} through Optic's proxy`)
    this.log(`${colors.bgRed(`app.listen(${port})`)} -> ${colors.black(colors.bgGreen(`app.listen(process.env.OPTIC_API_PORT)`))}\n`)

    this.log(colors.yellow('Need help? Click here to chat with one of our developers: ' + 'https://www.useoptic.com/docs?utm_medium=api-cli'))

    await cli.wait(1000)
    await cli.anykey('Press any key to continue')

    this.log('Optic is setup!')
    const config: IApiCliConfig = {
      name,
      commands: {
        start: command
      },
      proxy: {
        // tslint:disable-next-line:no-invalid-template-strings
        target: 'http://localhost:{{ENV.OPTIC_API_PORT}}',
        port
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
    files.forEach(async (file) => {
      await fs.ensureFile(file.path)
      await fs.writeFile(file.path, file.contents)
    })
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
    });

    cli.action.stop()

    if (response.status === 200) {
      const events = await response.json()
      return await this.createFileTree(events)
    } else {
      return this.error(`OAS parse error` + await response.text())
    }

  }
}
