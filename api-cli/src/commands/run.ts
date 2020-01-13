import {Command, flags} from '@oclif/command'
import * as findUp from 'find-up'
import {fromOptic} from '../lib/log-helper'
import {checkFor6to7} from '../lib/migration-helper'
import {runTask} from '../lib/runTask'
import {TransparentProxyCaptureSession} from '../lib/TransparentProxyCaptureSession'
import Init, {IApiCliConfig, IApiIntegrationsConfig, IApiIntegrationsConfigHosts} from './init'
import {ProxyCaptureSession, ICaptureSessionResult} from '../lib/proxy-capture-session'
import {CommandSession} from '../lib/command-session'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as getPort from 'get-port'
import {getPaths} from '../Paths'
// @ts-ignore
import analytics from '../lib/analytics'
// @ts-ignore
import * as Mustache from 'mustache'
import * as yaml from 'js-yaml'
// @ts-ignore
import * as opticEngine from '../../provided/domain.js'
import {IApiInteraction} from '../lib/common'
import * as colors from 'colors'
import {normalizeHost} from './intercept'

export default class Start extends Command {
  static description = 'run task by name'
  static args = [{
    name: 'taskName',
  }]

  async run() {
    const {args} = this.parse(Start)
    const {taskName} = args
    //migration check
    const shouldQuit = await checkFor6to7()
    if (shouldQuit) {
      return
    }

    let config
    try {
      config = await readApiConfig()
    } catch (e) {
      analytics.track('api start missing config')
      this.log(fromOptic('Optic needs more information about your API to continue.'))
      await Init.run([])
      return
    }
    await runTask(config, taskName)
    process.exit(0)
  }

  // async flushSession(result: ICaptureSessionResult, config: IApiCliConfig) {
  //   if (result.samples.length === 0 && result.integrationSamples.length === 0) {
  //     // this.log(fromOptic('No API interactions were observed.'))
  //     return null
  //   }
  //   // this.log(`[optic] Observed ${result.samples.length} API interaction(s)`)
  //
  //   const hasDiff = await checkDiffOrUnrecognizedPath(result)
  //   if (hasDiff) {
  //     this.log('`\n\n' + fromOptic(`New behavior was observed. Run ${colors.bold('api spec')} to review.`))
  //   }
  //
  //   const sessionId = `${result.session.start.toISOString()}-${result.session.end.toISOString()}`.replace(/:/g, '_')
  //   const fileName = `${sessionId}.optic_session.json`
  //   // @ts-ignore
  //   const {sessionsPath, integrationContracts} = await getPaths()
  //   const filePath = path.join(sessionsPath, fileName)
  //
  //   if (result.integrationSamples.length > 0) {
  //     (config.integrations || []).forEach(i => ensureIntegrationContractExists(i.name, integrationContracts))
  //     result.integrationSamples.forEach(sample => {
  //       const integrationName = integrationNameForHost(sample.request.host, config.integrations || [])
  //       // @ts-ignore
  //       sample.integrationName = integrationName
  //     })
  //   }
  //
  //   await fs.ensureFile(filePath)
  //   await fs.writeJSON(filePath, result)
  // }

  // async runProxySession(config: IApiCliConfig): Promise<ICaptureSessionResult> {
  //   const {flags} = this.parse(Start)
  //   const proxySession = new ProxyCaptureSession()
  //   const commandSession = new CommandSession()
  //
  //   const start = new Date()
  //   const port = await getPort({port: getPort.makeRange(3300, 3900)})
  //   const integrationsPort = await getPort({port: getPort.makeRange(4200, 4900)})
  //   const inputs = {
  //     ENV: {
  //       OPTIC_API_PORT: port,
  //       OPTIC_INTEGRATION_PORT: integrationsPort
  //     }
  //   }
  //
  //   //inbound proxy
  //   const target = processSetting(config.proxy.target, inputs)
  //   await proxySession.start({
  //     target,
  //     port: config.proxy.port
  //   })
  //   this.log(fromOptic(`Starting ${colors.bold(config.name)} on Port: ${colors.bold(config.proxy.port.toString())}, with ${colors.bold(config.commands.start)}`))
  //   this.log(fromOptic(`Starting Integration Gateway on Port: ${colors.bold(integrationsPort.toString())}`))
  //   this.log('\n')
  //   //starting outbound proxy
  //   const outboundProxy = new TransparentProxyCaptureSession()
  //
  //   const targetHosts = processHosts(config.integrations || [])
  //   outboundProxy.start({
  //     proxyPort: integrationsPort,
  //     targetHosts
  //   })
  //
  //   if (config.commands.start) {
  //     await commandSession.start({
  //       command: config.commands.start,
  //       environmentVariables: {
  //         ...process.env,
  //         //@ts-ignore
  //         OPTIC_API_PORT: inputs.ENV.OPTIC_API_PORT,
  //         OPTIC_INTEGRATION_PORT: integrationsPort.toString()
  //       }
  //     })
  //   }
  //
  //   const commandStoppedPromise = new Promise(resolve => {
  //     const {'keep-alive': keepAlive} = flags
  //     if (!keepAlive) {
  //       commandSession.events.on('stopped', () => resolve())
  //     }
  //   })
  //
  //   const processInterruptedPromise = new Promise((resolve) => {
  //     process.removeAllListeners('SIGINT')
  //     process.on('SIGINT', () => {
  //       resolve()
  //     })
  //   })
  //
  //   await Promise.race([commandStoppedPromise, processInterruptedPromise])
  //
  //   commandSession.stop()
  //   proxySession.stop()
  //   outboundProxy.stop()
  //
  //   const end = new Date()
  //   const samples = proxySession.getSamples()
  //   const integrationSamples = outboundProxy.getSamples()
  //
  //   return {
  //     session: {
  //       start,
  //       end
  //     },
  //     samples,
  //     integrationSamples
  //   }
  // }
}

export async function readApiConfig(): Promise<IApiCliConfig> {
  // @ts-ignore
  const {configPath} = await getPaths()
  const rawFile = await fs.readFile(configPath)
  const parsed = yaml.safeLoad(rawFile.toString())
  return parsed
}
//
// export const processSetting = (value: string, inputs: object) => Mustache.render(value, inputs)
//
// const {ApiInteraction, ApiRequest, ApiResponse} = opticEngine.com.seamless.diff
// const JsonHelper = opticEngine.com.seamless.diff.JsonHelper()
//
// function fromJs(x: any) {
//   if (x === undefined) {
//     return JsonHelper.toNone()
//   }
//   return JsonHelper.toSome(JsonHelper.fromString(JSON.stringify(x)))
// }
//
// export function toInteraction(sample: IApiInteraction) {
//   return ApiInteraction(
//     ApiRequest(sample.request.url, sample.request.method, sample.request.headers['content-type'] || '*/*', fromJs(sample.request.body)),
//     ApiResponse(sample.response.statusCode, sample.response.headers['content-type'] || '*/*', fromJs(sample.response.body))
//   )
// }
//
// export async function checkDiffOrUnrecognizedPath(result: ICaptureSessionResult) {
//   // @ts-ignore
//   const {specStorePath} = await getPaths()
//   const specStoreExists = await fs.pathExists(specStorePath)
//   if (!specStoreExists) {
//     return Promise.resolve(true)
//   }
//   const specAsBuffer = await fs.readFile(specStorePath)
//   try {
//     const differ = opticEngine.com.seamless.diff.SessionDiffer(specAsBuffer.toString())
//     for (const sample of result.samples) {
//       const interaction = toInteraction(sample)
//       if (differ.hasUnrecognizedPath(interaction) || differ.hasDiff(interaction)) {
//         return Promise.resolve(true)
//       }
//     }
//   } catch (e) {
//     console.error(e)
//     return Promise.resolve(false)
//   }
// }
//
// function processHosts(iApiIntegrationsConfigs: IApiIntegrationsConfig[]): string[] {
//   const set: Set<string> = new Set()
//   iApiIntegrationsConfigs.forEach(integration => IApiIntegrationsConfigHosts(integration).forEach((host: string) => set.add(normalizeHost(host))))
//   return Array.from([...set])
// }
//
// function integrationNameForHost(host: string, integrations: IApiIntegrationsConfig[]) {
//   const found = integrations.find(i => {
//     if (typeof i.host === 'string') {
//       return (i.host as string) === host
//     } else {
//       return (i.host as string[]).includes(host)
//     }
//   })
//   if (found) {
//     return found.name
//   }
// }
//
// async function ensureIntegrationContractExists(name: string, integrationContracts: string) {
//   const expectedPath = path.join(integrationContracts, `${name}_contract.json`)
//   if (!fs.existsSync(expectedPath)) {
//     const events = [
//       {APINamed: {name}}
//     ]
//     await fs.writeJson(expectedPath, events)
//   }
// }
