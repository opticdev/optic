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
import { getPaths } from '../Paths'
import { prepareEvents } from '../PersistUtils'
import * as yaml from 'js-yaml'
import analytics from '../lib/analytics'

export default class Generate extends Command {

  static description = 'generate something useful from your API spec'

  static flags = {
    // output: flags.string()
  }

  static args = [
    {name: 'buildId', description: 'what do you want to generate?', required: true}
  ]

  async run() {
    const { flags, args } = this.parse(Generate)
    const {buildId} = args

    if (flags.output) {
      analytics.track('init from web')
    }

    const {basePath, outputPath, specStorePath} = await getPaths()

    if (buildId === 'oas') {

      const fileContents = niceTry(() => fs.readFileSync(specStorePath).toString()) || '[]'
      cli.action.start('Generating OAS file')

      // @ts-ignore
      const response = await fetch('https://ayiz1s0f8f.execute-api.us-east-2.amazonaws.com/production/oas/generate', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({fileContents})
      });

      if (response.status === 200) {
        const oasJson = await response.json()
        fs.ensureDirSync(outputPath)
        cli.action.stop('done')
        const oasPath = path.join(outputPath, 'oas.json')
        fs.writeFileSync(path.join(outputPath, 'oas.json'), JSON.stringify(oasJson, null, 2))
        this.log('Writing OAS file to: ' + oasPath)
        return oasPath

      } else {
        return this.error('OAS Export Error' + await response.text())
      }
    } else {
      this.error(`No build exists for ${buildId}`)
    }

  }
}
