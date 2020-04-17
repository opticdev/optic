import {IBody} from '@useoptic/domain';
import {EventEmitter} from 'events';
import * as path from 'path';
import * as os from 'os';
import * as mockttp from 'mockttp';
import * as fs from 'fs-extra';
import * as launcher from '@httptoolkit/browser-launcher';
import {CallbackResponseResult} from 'mockttp/dist/rules/handlers';
import {CompletedRequest, MockRuleData} from 'mockttp';
import {IHttpInteraction} from '@useoptic/domain';
import {developerDebugLogger} from './logger';
//@ts-ignore
import {toBytes} from 'shape-hash';

export interface IHttpToolkitCapturingProxyConfig {
  proxyTarget?: string
  proxyPort: number
  host: string
  flags: {
    chrome: boolean
    includeJsonBody: boolean
    includeTextBody: boolean
    includeShapeHash: boolean
  }
}

export interface IRequestFilter {
  shouldSkip(request: CompletedRequest): boolean
}

class HttpToolkitRequestFilter implements IRequestFilter {
  constructor(private self: string, private target?: string) {
  }

  shouldSkip(request: CompletedRequest): boolean {
    if (this.target) {
      if (request.path === opticStatusPath) {
        return true;
      }

      if (request.hostname === this.self || request.url.startsWith(this.self)) {
        return false;
      }

      return request.hostname === this.target || request.url.startsWith(this.target);
    }
    return false;
  }
}

export const opticStatusPath = '/__optic_status';

export class HttpToolkitCapturingProxy {
  private proxy!: mockttp.Mockttp;
  private chrome!: launcher.BrowserInstance;
  private requests: Map<string, mockttp.CompletedRequest> = new Map();
  private config!: IHttpToolkitCapturingProxyConfig;
  public readonly events: EventEmitter = new EventEmitter();

  async start(config: IHttpToolkitCapturingProxyConfig) {
    this.config = config;
    const tempBasePath = path.join(os.tmpdir(), 'optic-');
    const configPath = await fs.mkdtemp(tempBasePath);
    const certificateInfo = await mockttp.generateCACertificate({
      bits: 2048,
      commonName: 'Optic Labs Corp'
    });
    const certificatePath = path.join(configPath, '.optic', 'certificates');
    await fs.ensureDir(certificatePath);
    const certPath = path.join(certificatePath, 'ca.cert');
    const keyPath = path.join(certificatePath, 'ca.key');
    await fs.writeFile(certPath, certificateInfo.cert);
    await fs.writeFile(keyPath, certificateInfo.key);
    const https = {
      certPath,
      keyPath
    };

    const proxy = mockttp.getLocal({
      cors: false,
      debug: false,
      https,
      recordTraffic: false
    });

    this.proxy = proxy;

    const rules: MockRuleData[] = [];
    if (config.proxyTarget) {
      developerDebugLogger(`forwarding requests to ${config.proxyTarget}`);
      rules.push(
        {
          matchers: [
            new mockttp.matchers.WildcardMatcher()
          ],
          handler: new mockttp.handlers.PassThroughHandler({
            forwarding: {
              targetHost: config.proxyTarget,
              updateHostHeader: true
            }
          })
        }
      );
    } else {
      rules.push(
        {
          matchers: [
            new mockttp.matchers.WildcardMatcher()
          ],
          handler: new mockttp.handlers.PassThroughHandler()
        }
      );
    }
    await proxy.addRules(
      {
        matchers: [
          new mockttp.matchers.SimplePathMatcher(opticStatusPath)
        ],
        handler: new mockttp.handlers.CallbackHandler(() => {
          const response: CallbackResponseResult = {
            statusCode: 200,
          };
          return response;
        })
      },
      ...rules
    );
    const requestFilter: IRequestFilter = new HttpToolkitRequestFilter(config.host, config.proxyTarget);

    await proxy.on('request', (req: mockttp.CompletedRequest) => {
      const shouldCapture = !requestFilter.shouldSkip(req);
      if (!shouldCapture) {
        developerDebugLogger(`skipping ${req.method} ${req.url}`);
      }
      if (shouldCapture) {
        this.requests.set(req.id, req);
      }
    });

    await proxy.on('response', (res: mockttp.CompletedResponse) => {
      if (this.requests.has(res.id)) {
        const req = this.requests.get(res.id);
        if (!req) {
          return;
        }
        developerDebugLogger(req);
        const sample: IHttpInteraction = {
          tags: [],
          uuid: res.id,
          request: {
            host: req.hostname || '',
            method: req.method,
            path: req.path,
            headers: {
              asJsonString: null,
              asText: null,
              asShapeHashBytes: null
            },
            query: {
              asJsonString: null,
              asText: null,
              asShapeHashBytes: null
            },
            body: this.extractBody(req)
          },
          response: {
            statusCode: res.statusCode,
            headers: {
              asShapeHashBytes: null,
              asJsonString: null,
              asText: null
            },
            body: this.extractBody(res)
          }
        };
        developerDebugLogger({sample});
        this.events.emit('sample', sample);
        this.requests.delete(res.id);
      }
    });

    process.on('uncaughtException', (error: Error) => {
      developerDebugLogger(error);
    });
    process.on('unhandledRejection', (reason, promise) => {
      developerDebugLogger(reason, promise);
    });

    developerDebugLogger(`trying to start proxy on port ${config.proxyPort}`);
    try {
      await proxy.start({
        startPort: config.proxyPort,
        endPort: config.proxyPort
      });
      developerDebugLogger(`proxy started on port ${proxy.port}`);
    } catch (e) {
      throw new Error(`Optic couldn't start a proxy on port ${config.proxyPort} - please make sure there is nothing running there`);
    }

    if (config.flags.chrome) {
      this.chrome = await new Promise((resolve, reject) => {
        //@ts-ignore
        launcher((err, launch) => {
          if (err) {
            return reject(err);
          }
          const launchUrl = `https://docs.useoptic.com`;
          const spkiFingerprint = mockttp.generateSPKIFingerprint(certificateInfo.cert);
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
          };
          launch(launchUrl, launchOptions, function (err: any, instance: launcher.BrowserInstance | PromiseLike<launcher.BrowserInstance> | undefined) {
            if (err) {
              return reject(err);
            }
            resolve(instance);
          });
        });
      });
    }
  }

  extractBody(req: mockttp.CompletedRequest | mockttp.CompletedResponse): IBody {
    if (req.headers['content-type'] || req.headers['transfer-encoding']) {
      const json = req.body.json || req.body.formData || null;
      return {
        contentType: req.headers['content-type'] || null,
        value: {
          asShapeHashBytes: this.config.flags.includeShapeHash && json ? {bytes: toBytes(json)} : null,
          asJsonString: this.config.flags.includeJsonBody && json ? JSON.stringify(json) : null,
          asText: this.config.flags.includeTextBody && json ? null : req.body.text || null
        }
      };
    }
    return {
      contentType: null,
      value: {
        asText: null,
        asJsonString: null,
        asShapeHashBytes: null
      }
    };
  }

  async stop() {
    await this.proxy.stop();
    if (this.config.flags.chrome) {
      const promise = new Promise((resolve) => {
        const timeoutId = setTimeout(resolve, 2000);
        //@ts-ignore
        this.chrome.on('stop', () => {
          clearTimeout(timeoutId);
          resolve();
        });
      });
      this.chrome.stop();
      await promise;
    }
  }
}

