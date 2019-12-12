import { Command, flags } from '@oclif/command'
import { ICaptureSessionResult } from '../lib/proxy-capture-session'
import * as getPort from 'get-port'
import { IApiInteraction } from '../lib/common'
import { startServer, ISessionValidatorAndLoader, makeInitialDiffState } from './spec'
//@ts-ignore
import * as openBrowser from 'react-dev-utils/openBrowser'
import * as Express from 'express'
import { FreshChrome } from 'httptoolkit-server/lib/interceptors/fresh-chrome'
import * as mockttp from 'mockttp'
import * as fs from 'fs-extra'
import * as tmp from 'tmp'
import * as path from 'path'
import { EventEmitter } from 'events'
import { fromOptic } from '../lib/log-helper'
import { getPaths } from '../Paths'
import * as os from 'os';
import { CallbackResponseResult } from 'mockttp/dist/rules/handlers'

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

function extractBody(req: mockttp.CompletedRequest | mockttp.CompletedResponse) {
  if (req.headers['content-type'] || req.headers['transfer-encoding']) {
    return req.body.json || req.body.formData || req.body.text
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
  private interceptor!: FreshChrome
  private requests: Map<string, mockttp.CompletedRequest> = new Map()
  private samples: IApiInteraction[] = []
  private config!: IHttpToolkitProxyCaptureSessionConfig
  public readonly events: EventEmitter = new EventEmitter()

  async start(config: IHttpToolkitProxyCaptureSessionConfig) {
    this.config = config
    const configPath = tmp.dirSync({ unsafeCleanup: true }).name
    const certificateInfo = await mockttp.generateCACertificate({
      bits: 2048,
      commonName: 'Optic Labs Corp'
    })
    const certificatePath = path.join(configPath, '.optic', 'certificates')
    await fs.ensureDir(certificatePath);
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
    this.proxy = proxy;
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
          };
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

        const sample: IApiInteraction = {
          request: {
            method: req.method,
            url: req.path,
            headers: req.headers,
            cookies: {},
            queryParameters: {},
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
      const interceptor = new FreshChrome({
        configPath,
        https
      })
      this.interceptor = interceptor;
      interceptor.activate(config.proxyPort)
    }
  }

  async stop() {
    await this.proxy.stop()
    if (this.config.flags.chrome) {
      await this.interceptor.deactivateAll()
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
    const { args } = this.parse(Intercept);

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
    await startServer(paths, sessionValidatorAndLoader, cliServerPort)

    const cliServerUrl = `http://localhost:${cliServerPort}/live-session`
    await openBrowser(cliServerUrl)

    await this.runProxySession(proxySession, proxyPort, targetHost)

    await process.exit(0)
  }

  async runProxySession(proxySession: HttpToolkitProxyCaptureSession, proxyPort: number, targetHost: string): Promise<ICaptureSessionResult> {
    const { flags } = this.parse(Intercept)

    const start = new Date()

    const processInterruptedPromise = new Promise((resolve) => {
      process.removeAllListeners('SIGINT');
      process.on('SIGINT', () => {
        resolve()
      })
    })
    await proxySession.start({ proxyPort, targetHost, flags: { chrome: flags.chrome } })
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
      samples
    }
  }
}

export function normalizeHost(hostString: string) {
  if (hostString.startsWith('http://')) {
    return hostString.substring('http://'.length)
  }
  if (hostString.startsWith('https://')) {
    return hostString.substring('https://'.length)
  }
  return hostString
}
