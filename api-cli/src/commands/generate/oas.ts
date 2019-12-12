import {Command, flags} from '@oclif/command'
import * as fs from 'fs-extra'
import * as clipboardy from 'clipboardy'
// @ts-ignore
import * as niceTry from 'nice-try'
import * as os from "os"
import * as path from 'path'
// @ts-ignore
import * as opticEngine from '../../../provided/domain.js'
import cli from 'cli-ux'
// @ts-ignore
import * as fetch from 'node-fetch'
import {fromOptic} from '../../lib/log-helper'
import {getPaths} from '../../Paths'
import {prepareEvents} from '../../PersistUtils'
import analytics from '../../lib/analytics'
import * as yaml from 'js-yaml'
import {normalizeHost} from '../intercept'


export default class GenerateOas extends Command {

  static description = 'export an OpenAPI 3.1 spec'

  static flags = {
    json: flags.boolean(),
    yaml: flags.boolean(),
    host: flags.string()
  }

  async run() {

    const {flags} = this.parse(GenerateOas)

    // @ts-ignore
    const {outputPath, specStorePath} = await (async () => {
      if (flags.host) {
        const targetHost = normalizeHost(flags.host)
        return getPaths(() => {
          const homePath = path.join(os.homedir(), '.apis', targetHost.replace(/:/gi, '_'), '.api')
          this.log(fromOptic(`Working out of ${homePath}`))
          return homePath
        })
      } else {
        return getPaths()
      }
    })()
    const oasGenerator = opticEngine.com.seamless.contexts.rfc.projections.OASProjectionHelper()

    const fileContents = niceTry(() => fs.readFileSync(specStorePath).toString()) || '[]'
    cli.action.start('Generating OAS file')

    try {
      const specAsJson = oasGenerator.fromEventString(fileContents)

      const writeJson = flags.json || (!flags.json && !flags.yaml)
      const writeYaml = flags.yaml

      cli.action.stop('Done!')

      if (writeJson) {
        fs.ensureDirSync(outputPath)
        const oasPath = path.join(outputPath, 'openapi.json')
        fs.writeFileSync(path.join(outputPath, 'openapi.json'), JSON.stringify(specAsJson, null, 2))
        this.log('OpenAPI written to ' + oasPath)
        return oasPath
      }

      if (writeYaml) {
        fs.ensureDirSync(outputPath)
        const oasPath = path.join(outputPath, 'openapi.yaml')
        fs.writeFileSync(path.join(outputPath, 'openapi.yaml'), yaml.safeDump(specAsJson, {indent: 1}))
        this.log('OpenAPI written to ' + oasPath)
        return oasPath
      }

    } catch (e) {
      console.error('Error generating OpenAPI ')
      console.log(e)
    }
  }
}
