import {Command, flags} from '@oclif/command'
import * as fs from 'fs-extra'
import * as clipboardy from 'clipboardy'
// @ts-ignore
import * as niceTry from 'nice-try'
import * as path from 'path'
import cli from 'cli-ux'
import {readmePath, specStorePath} from '../Paths'
import {prepareEvents} from '../PersistUtils'

export default class Init extends Command {

  static description = 'start an optic API Spec in your repo'

  static flags = {
    // can pass either --force or -f
    paste: flags.boolean({}),
    // 'oas-import': flags.string({})
  }

  static args = []

  async run() {
    const {flags} = this.parse(Init)
    if (flags.paste) {
      await this.webImport()
    } else {
      await this.blankWithName()
    }

    this.log('\n\nAPI Spec successfully added ' + path.join(process.cwd(), '.api'))
    this.log("Run 'api spec' to view and edit the specification")
  }

  async blankWithName() {
    const name = await cli.prompt('Name your API')
    this.createFileTree([
      {APINamed: {name}}
    ])
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
    return this.createFileTree(events)
  }

  async createFileTree(events: any[]) {
    await fs.ensureFile(specStorePath)
    await fs.writeFile(specStorePath, prepareEvents(events))

    const readmeContents = await fs.readFile(path.join(__dirname, '../../resources/docs-readme.md'))

    await fs.ensureFile(readmePath)
    await fs.writeFile(readmePath, readmeContents)
  }

}
