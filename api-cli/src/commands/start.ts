import { Command, flags } from '@oclif/command'
import {fromOptic} from '../lib/log-helper'
import Init, { IApiCliConfig } from './init';
import { ProxyCaptureSession, ICaptureSessionResult } from '../lib/proxy-capture-session';
import { CommandSession } from '../lib/command-session';
import * as fs from 'fs-extra'
import * as path from 'path'
import * as getPort from 'get-port'
import { getPaths } from '../Paths';
import analytics from '../lib/analytics'
// @ts-ignore
import * as Mustache from 'mustache'
import * as yaml from 'js-yaml'
// @ts-ignore
import * as opticEngine from 'optic-domain'
import { IApiInteraction } from '../lib/common';
import * as colors from 'colors'

export async function readApiConfig(): Promise<IApiCliConfig> {
  const { configPath } = await getPaths()
  const rawFile = await fs.readFile(configPath)
  const parsed = yaml.safeLoad(rawFile.toString())
  return parsed
  // return {
  //   proxy: {
  //     target: 'https://my-json-server.typicode.com',
  //     port: 3000
  //   },
  //   commands: {
  //     start: 'echo "started" && sleep 5 && echo "stopped" && exit 1'
  //   },
  //   name: 'ddoshi'
  // }
}
const { ApiInteraction, ApiRequest, ApiResponse } = opticEngine.com.seamless.diff;
const JsonHelper = opticEngine.com.seamless.diff.JsonHelper()
function fromJs(x: any) {
  return JsonHelper.fromString(JSON.stringify(x))
}

export function toInteraction(sample: IApiInteraction) {
  return ApiInteraction(
    ApiRequest(sample.request.url, sample.request.method, sample.request.headers['content-type'] || '*/*', fromJs(sample.request.body)),
    ApiResponse(sample.response.statusCode, sample.response.headers['content-type'] || '*/*', fromJs(sample.response.body))
  )
}

export async function checkDiffOrUnrecognizedPath(result: ICaptureSessionResult) {
  const { specStorePath } = await getPaths()
  const specStoreExists = await fs.pathExists(specStorePath)
  if (!specStoreExists) { return Promise.resolve(false) }
  const specAsBuffer = await fs.readFile(specStorePath)
  try {
    const differ = opticEngine.com.seamless.diff.SessionDiffer(specAsBuffer.toString())
    for (const sample of result.samples) {
      const interaction = toInteraction(sample)
      if (differ.hasUnrecognizedPath(interaction) || differ.hasDiff(interaction)) {
        return Promise.resolve(true)
      }
    }
  } catch (e) {
    console.error(e)
    return Promise.resolve(false)
  }
}

export default class Start extends Command {
  static description = 'start your API and diff its behavior against the spec'

  static flags = {
    'keep-alive': flags.boolean({ description: 'use this when your command terminates before the server terminates' })
  }

  static args = []

  async run() {

    let config;
    try {
      config = await readApiConfig()
    } catch (e) {
      analytics.track('api start missing config')
      this.log(fromOptic('Optic needs more information about your API to continue.'))
      await Init.run([])
      return
    }
    analytics.track('api start', { name: config.name })
    const result = await this.runProxySession(config)
    analytics.track('api server stopped. ', { name: config.name, sampleCount: result.samples.length })

    await this.flushSession(result)
  }

  async flushSession(result: ICaptureSessionResult) {
    if (result.samples.length === 0) {
      // this.log(fromOptic('No API interactions were observed.'))
      return null
    }
    // this.log(`[optic] Observed ${result.samples.length} API interaction(s)`)

    const hasDiff = await checkDiffOrUnrecognizedPath(result)
    if (hasDiff) {
      this.log('`\n\n' + fromOptic(`New behavior was observed. Run ${colors.bold('api spec')} to review.`))
    }

    const sessionId = `${result.session.start.toISOString()}-${result.session.end.toISOString()}`;
    const fileName = `${sessionId}.optic_session.json`
    const { sessionsPath } = await getPaths()
    const filePath = path.join(sessionsPath, fileName)
    await fs.ensureFile(filePath)
    await fs.writeJSON(filePath, result)
  }

  async runProxySession(config: IApiCliConfig): Promise<ICaptureSessionResult> {
    const { flags } = this.parse(Start)
    const proxySession = new ProxyCaptureSession()
    const commandSession = new CommandSession()

    const start = new Date()

    const port = await getPort({port: getPort.makeRange(3300, 3900)})
    const inputs = {
      ENV: {
        OPTIC_API_PORT: port
      }
    }

    const processSetting = (value: string) => Mustache.render(value, inputs)

    const target = processSetting(config.proxy.target)

    await proxySession.start({
      target,
      port: config.proxy.port
    })
    this.log(fromOptic(`Starting ${colors.bold(config.name)} on Port: ${colors.bold(config.proxy.port.toString())}, with ${colors.bold(config.commands.start)}`))
    this.log(`\n`)

    if (config.commands.start) {
      await commandSession.start({
        command: config.commands.start,
        environmentVariables: {
          ...process.env,
          //@ts-ignore
          OPTIC_API_PORT: inputs.ENV.OPTIC_API_PORT
        }
      })
    }

    const commandStoppedPromise = new Promise((resolve) => {
      const { 'keep-alive': keepAlive } = flags
      if (!keepAlive) {
        commandSession.events.on('stopped', () => resolve())
      }
    })

    const processInterruptedPromise = new Promise((resolve) => {
      process.on('SIGINT', () => {
        resolve()
      })
    })

    await Promise.race([commandStoppedPromise, processInterruptedPromise])

    commandSession.stop()
    proxySession.stop()

    const end = new Date()
    const samples = proxySession.getSamples()

    return {
      session: {
        start,
        end
      },
      samples
    }
  }
}
