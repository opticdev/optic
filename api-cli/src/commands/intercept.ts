import {Command, flags} from '@oclif/command'
import {ICaptureSessionResult} from '../lib/proxy-capture-session'
import * as getPort from 'get-port'
import {IApiInteraction} from '../lib/common'
import {extractBody} from '../lib/TransparentProxyCaptureSession'
import {IApiCliConfig} from './init'
import {startServer, ISessionValidatorAndLoader, makeInitialDiffState} from './spec'
// @ts-ignore
import * as openBrowser from 'react-dev-utils/openBrowser'
import * as Express from 'express'
import * as mockttp from 'mockttp'
import * as fs from 'fs-extra'
import * as path from 'path'
import {EventEmitter} from 'events'
import {fromOptic} from '../lib/log-helper'
import {getPaths} from '../Paths'
import * as os from 'os'
import {CallbackResponseResult} from 'mockttp/dist/rules/handlers'
import * as url from 'url'
import * as qs from 'querystring'
import * as launcher from '@httptoolkit/browser-launcher'

interface IWithSamples {
  getSamples(): IApiInteraction[]
}

class InMemorySessionValidatorAndLoader implements ISessionValidatorAndLoader {
  proxySession: IWithSamples

  constructor(proxySession: IWithSamples) {
    this.proxySession = proxySession
  }

  validateSessionId = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    req.optic = {
      session: {
        samples: this.proxySession.getSamples()
      },
      diffState: makeInitialDiffState()
    }
    next()
  }

}

interface IHttpToolkitProxyCaptureSessionConfig {
  proxyPort: number,
  targetHost: string,
  flags: {
    chrome: boolean
  }
}

class HttpToolkitProxyCaptureSession implements IWithSamples {
  private proxy!: mockttp.Mockttp
  private chrome!: launcher.BrowserInstance
  private requests: Map<string, mockttp.CompletedRequest> = new Map()
  private samples: IApiInteraction[] = []
  private config!: IHttpToolkitProxyCaptureSessionConfig
  public readonly events: EventEmitter = new EventEmitter()

  async start(config: IHttpToolkitProxyCaptureSessionConfig) {
    this.config = config
    const tempBasePath = path.join(os.tmpdir(), 'optic-')
    const configPath = await fs.mkdtemp(tempBasePath)
    const certificateInfo = await mockttp.generateCACertificate({
      bits: 2048,
      commonName: 'Optic Labs Corp'
    })
    const certificatePath = path.join(configPath, '.optic', 'certificates')
    await fs.ensureDir(certificatePath)
    const certPath = path.join(certificatePath, 'ca.cert')
    const keyPath = path.join(certificatePath, 'ca.key')
    await fs.writeFile(certPath, certificateInfo.cert)
    await fs.writeFile(keyPath, certificateInfo.key)
    const https = {
      certPath,
      keyPath
    }

    const proxy = mockttp.getLocal({
      cors: true,
      debug: false,
      https,
      recordTraffic: false
    })
    this.proxy = proxy
    proxy.addRules(
      {
        matchers: [
          new mockttp.matchers.HostMatcher('amiusing.httptoolkit.tech')
        ],
        handler: new mockttp.handlers.CallbackHandler(request => {
          const response: CallbackResponseResult = {
            statusCode: 302,
            headers: {
              location: `https://${config.targetHost}`
            }
          }
          return response
        })
      },
      {
        matchers: [
          new mockttp.matchers.WildcardMatcher()
        ],
        handler: new mockttp.handlers.PassThroughHandler()
      }
    )

    proxy.on('request', (req: mockttp.CompletedRequest) => {
      if (req.headers.host === config.targetHost) {
        this.requests.set(req.id, req)
      }
    })

    proxy.on('response', (res: mockttp.CompletedResponse) => {
      if (this.requests.has(res.id)) {
        const req = this.requests.get(res.id) as mockttp.CompletedRequest
        const queryString: string = url.parse(req.url).query || ''
        const queryParameters = qs.parse(queryString)

        const sample: IApiInteraction = {
          request: {
            method: req.method,
            host: normalizeHost(req.hostname || ''),
            url: req.path,
            headers: req.headers,
            cookies: {},
            queryParameters,
            body: extractBody(req)
          },
          response: {
            statusCode: res.statusCode,
            headers: res.headers,
            body: extractBody(res)
          }
        }
        this.samples.push(sample)
      }
    })

    await proxy.start(config.proxyPort)

    if (config.flags.chrome) {
      this.chrome = await new Promise((resolve, reject) => {
        //@ts-ignore
        launcher(function (err, launch) {
          if (err) {
            return reject(err)
          }
          const launchUrl = `https://docs.useoptic.com`
          const spkiFingerprint = mockttp.generateSPKIFingerprint(certificateInfo.cert)
          const launchOptions: launcher.LaunchOptions = {
            profile: configPath,
            browser: 'chrome',
            proxy: `https://127.0.0.1:${config.proxyPort}`,
            noProxy: [
              '<-loopback>',
            ],
            options: [
              `--ignore-certificate-errors-spki-list=${spkiFingerprint}`
            ]
          }
          launch(launchUrl, launchOptions, function (err, instance) {
            if (err) {
              return reject(err)
            }
            resolve(instance)
          })
        })
      })
    }
  }

  async stop() {
    await this.proxy.stop()
    if (this.config.flags.chrome) {
      const promise = new Promise((resolve) => {
        const timeoutId = setTimeout(resolve, 2000)
        //@ts-ignore
        this.chrome.on('stop', () => {
          clearTimeout(timeoutId)
          resolve()
        })
      })
      this.chrome.stop()
      await promise
    }
  }

  getSamples() {
    return this.samples
  }
}

export default class Intercept extends Command {

  static args = [
    {
      required: true,
      name: 'host',
      description: 'hostname and port to intercept requests to (e.g. localhost:3000)'
    }
  ]
  static flags = {
    chrome: flags.boolean({
      default: false,
    })
  }

  async run() {
    const {args} = this.parse(Intercept)

    const cliServerPort = await getPort({
      port: [3201]
    })
    const proxyPort = await getPort({
      port: [30333]
    })

    const proxySession = new HttpToolkitProxyCaptureSession()

    const sessionValidatorAndLoader = new InMemorySessionValidatorAndLoader(proxySession)
    const targetHost = normalizeHost(args.host)

    const paths = await getPaths(() => {
      const homePath = path.join(os.homedir(), '.apis', targetHost.replace(/:/gi, '_'), '.api')
      this.log(fromOptic(`Working out of ${homePath}`))
      return homePath
    })
    const config: IApiCliConfig = {
      integrations: [],
      name: '',
      commands: {
        start: ''
      },
      proxy: {
        target: '',
        port: 99999
      }
    }
    await startServer(paths, sessionValidatorAndLoader, cliServerPort, config)
    const cliServerUrl = `http://localhost:${cliServerPort}/live-session`
    await openBrowser(cliServerUrl)

    await this.runProxySession(proxySession, proxyPort, targetHost)

    await process.exit(0)
  }

  async runProxySession(proxySession: HttpToolkitProxyCaptureSession, proxyPort: number, targetHost: string): Promise<ICaptureSessionResult> {
    const {flags} = this.parse(Intercept)

    const start = new Date()

    const processInterruptedPromise = new Promise((resolve) => {
      process.removeAllListeners('SIGINT')
      process.on('SIGINT', () => {
        resolve()
      })
    })
    await proxySession.start({proxyPort, targetHost, flags: {chrome: flags.chrome}})
    this.log(fromOptic(`Started proxy server on https://localhost:${proxyPort}`))
    this.log(fromOptic(`Capturing requests to ${targetHost}`))
    this.log(fromOptic('Press ^C (Control+C) to stop'))
    await Promise.race([processInterruptedPromise])
    await proxySession.stop()

    const end = new Date()
    const samples = proxySession.getSamples()

    return {
      session: {
        start,
        end
      },
      samples,
      integrationSamples: []
    }
  }
}

// try to handle whatever people
export function normalizeHost(hostString: string): string {
  const isUrlLike = hostString.startsWith('http://') || hostString.startsWith('https://')
  if (isUrlLike) {
    return url.parse(hostString).host!
  }
  return url.parse(`http://${hostString}`).host!
}
