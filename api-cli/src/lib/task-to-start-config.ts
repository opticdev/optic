import * as getPort from 'get-port'
import * as url from 'url'
import {IOpticTask} from '../commands/init'

export interface IOpticTaskRunnerConfig {
  serviceConfig: {
    port: number
    host: string
    protocol: string
    basePath: string
  }
  proxyConfig: {
    port: number
    host: string
    protocol: string
    basePath: string
  }
}

export async function TaskToStartConfig(task: IOpticTask): Promise<IOpticTaskRunnerConfig> {

  const parsedBaseUrl = url.parse(task.baseUrl)
  const randomPort = await getPort({port: getPort.makeRange(3300, 3900)})
  const serviceProtocol = parsedBaseUrl.protocol || 'http:'
  const proxyPort = parsedBaseUrl.port || (serviceProtocol === 'http:' ? '80' : '443')

  const parsedProxyBaseUrl = task.proxy && url.parse(task.proxy)

  return {
    serviceConfig: {
      port: randomPort,
      host: parsedBaseUrl.hostname || 'localhost',
      protocol: serviceProtocol,
      basePath: parsedBaseUrl.path || '/',
    },
    proxyConfig: {
      port: parseInt(parsedProxyBaseUrl ? (parsedProxyBaseUrl.port || (serviceProtocol === 'http:' ? '80' : '443')) : proxyPort, 10),
      host: (parsedProxyBaseUrl ? parsedProxyBaseUrl.hostname : parsedBaseUrl.hostname) || 'localhost',
      protocol: (parsedProxyBaseUrl ? parsedProxyBaseUrl.protocol : serviceProtocol) || 'http:',
      basePath: parsedBaseUrl.path || '/',
    }
  }
}
