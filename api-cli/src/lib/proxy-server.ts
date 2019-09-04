import * as debug from 'debug'
import * as express from 'express'
import {Request} from 'express'
import * as expressHttpProxy from 'express-http-proxy'
import * as http from 'http'
import {IApiInteraction, packageRequest, addBodyParsers} from './common'

import * as EventEmitter from 'events'

interface IProxyServerOptions {
  proxyPort: number,
  target: string
}

const debugProxyServerVerbose = debug('optic-debug:server:proxy-server')
const debugProxyServer = debug('optic:server:proxy-server')

class ProxyServer extends EventEmitter {
  private httpInstance?: http.Server

  public start(options: IProxyServerOptions) {

    const server = express()
    addBodyParsers(server)
    const proxyMiddleware = expressHttpProxy(options.target, {
      userResDecorator: (proxyRes: any, proxyResData: Buffer, userReq: Request) => {
        let responseBody = proxyResData.toString('utf8')
        try {
          responseBody = JSON.parse(responseBody)
        } catch (e) {

        }

        const request = packageRequest(userReq)

        const sample: IApiInteraction = {
          request,
          response: {
            statusCode: proxyRes.statusCode,
            headers: proxyRes.headers,
            body: responseBody,
          },
        }
        this.emit('sample', sample)

        return proxyResData
      },
    })
    server.use('/', (_req, _res, next) => {
      debugProxyServerVerbose('got request')
      next()
    }, proxyMiddleware)

    return new Promise<void>((resolve, reject) => {
      this.httpInstance = server
        .listen(options.proxyPort, () => {
          debugProxyServer(`proxy listening on port ${options.proxyPort}`)
          debugProxyServer(`proxy forwarding requests to ${options.target}`)
          resolve()
        })
        .on('error', reject)
    })
  }

  public stop() {
    if (this.httpInstance) {
      this.httpInstance.close()
    }
  }
}

export {
  ProxyServer,
}
