import {EventEmitter} from 'events'
import * as fs from 'fs-extra'
import {FreshChrome} from 'httptoolkit-server/lib/interceptors/fresh-chrome'
import * as mockttp from 'mockttp'
import {CallbackResponseResult} from 'mockttp/dist/rules/handlers'
import * as path from 'path'
import * as qs from 'querystring'
import * as tmp from 'tmp'
import * as url from 'url'
import {normalizeHost} from '../commands/intercept'
import {IApiInteraction} from './common'

export interface IWithSamples {
  getSamples(): IApiInteraction[]
}

export interface ITransparentProxyCaptureSessionConfig {
  proxyPort: number,
  targetHosts: string[]
}

export class TransparentProxyCaptureSession implements IWithSamples {
  private proxy!: mockttp.Mockttp
  private interceptor!: FreshChrome
  private requests: Map<string, mockttp.CompletedRequest> = new Map()
  private samples: IApiInteraction[] = []
  private config!: ITransparentProxyCaptureSessionConfig
  private unknownHosts: string[] = []
  public readonly events: EventEmitter = new EventEmitter()

  async start(config: ITransparentProxyCaptureSessionConfig) {
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
          new mockttp.matchers.WildcardMatcher()
        ],
        handler: new mockttp.handlers.PassThroughHandler()
      }
    )

    proxy.on('request', (req: mockttp.CompletedRequest) => {
      if (config.targetHosts.includes(req.headers.host)) {
        this.requests.set(req.id, req)
      } else {
        this.unknownHosts.push(normalizeHost(req.headers.host))
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
  }

  async stop() {
    await this.proxy.stop()
  }

  getSamples() {
    return this.samples
  }
}

export function extractBody(req: mockttp.CompletedRequest | mockttp.CompletedResponse) {
  if (req.headers['content-type'] || req.headers['transfer-encoding']) {
    return req.body.json || req.body.formData || req.body.text
  }
}
