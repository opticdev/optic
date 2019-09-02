import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import Init, { IApiCliConfig } from './init';
import { ProxyCaptureSession, ICaptureSessionResult } from '../lib/proxy-capture-session';
import { CommandSession } from '../lib/command-session';
import * as fs from 'fs-extra'
import * as path from 'path'
import { getPaths } from '../Paths';
import analytics from '../lib/analytics'
import * as yaml from 'js-yaml'
import * as opticEngine from 'optic-domain'
import { IApiInteraction } from '../lib/common';

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

async function checkDiffOrUnrecognizedPath(result: ICaptureSessionResult) {
  const { specStorePath } = await getPaths()
  const specStoreExists = await fs.pathExists(specStorePath)
  if (!specStoreExists) { return Promise.resolve(false) }
  const specAsBuffer = await fs.readFile(specStorePath)
  try {
    const differ = opticEngine.com.seamless.diff.SessionDiffer(specAsBuffer.toString())
    for (const sample of result.samples) {
      const interaction = toInteraction(sample)
      if (differ.hasUnrecognizedPath(interaction)) {
        console.log('unrecognized path')
        return Promise.resolve(true)
      } else if (differ.hasDiff(interaction)) {
        console.log('diff observed')
        return Promise.resolve(true)
      }
    }
  } catch (e) {
    console.error(e)
    return Promise.resolve(false)
  }
}

export default class Start extends Command {
  static description = 'documents your API by monitoring local traffic'

  static flags = {}

  static args = []

  async run() {
    let config;
    try {
      config = await readApiConfig()
    } catch (e) {
      analytics.track('api start missing config')
      this.log(`[incomplete setup] Optic needs some more information to continue.`)
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
      this.log('No API interactions were observed.')
      return null
    }
    this.log(`[optic] Observed ${result.samples.length} API interaction(s)`)
    await checkDiffOrUnrecognizedPath(result)
    const sessionId = `${result.session.start.toISOString()}-${result.session.end.toISOString()}`;
    const fileName = `${sessionId}.optic_session.json`
    const { sessionsPath } = await getPaths()
    const filePath = path.join(sessionsPath, fileName)
    await fs.ensureFile(filePath)
    await fs.writeJSON(filePath, result)
  }

  async runProxySession(config: IApiCliConfig): Promise<ICaptureSessionResult> {
    const proxySession = new ProxyCaptureSession()
    const commandSession = new CommandSession()

    const start = new Date()

    await proxySession.start({
      target: config.proxy.target,
      port: config.proxy.port
    })

    this.log(`[optic] Started proxy server listening on http://localhost:${config.proxy.port}`)
    this.log(`[optic] Forwarding requests to ${config.proxy.target}`)

    this.log(`[optic] Starting command: ${config.commands.start}`)
    const anyKeyPromise = cli.anykey('Press any key to stop API server')
      .catch((e) => {
        // if we don't catch ctrl+c here then .anykey() throws an error
        // console.error(e)
      })
    this.log(`\n`)

    await commandSession.start({
      command: config.commands.start,
      environmentVariables: {}
    })

    const commandStoppedPromise = new Promise((resolve) => {
      commandSession.events.on('stopped', () => resolve())
    })

    await Promise.race([anyKeyPromise, commandStoppedPromise])

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
