// @ts-ignore
import {TaskToStartConfig} from '../src/lib/task-to-start-config'
import * as assert from 'assert'
// @ts-ignore
import * as equals from 'deep-equal'

describe('Task to start config', () => {
  it('handles a simple local target', async () => {
    const result = await TaskToStartConfig({
      command: 'echo "Test"',
      baseUrl: 'http://localhost:3000'
    })

    assert(equals(result, {
      serviceConfig:
        {
          port: 3300,
          host: 'localhost',
          protocol: 'http:',
          basePath: '/'
        },
      proxyConfig:
        {
          port: 3000,
          host: 'localhost',
          protocol: 'http:',
          basePath: '/'
        }
    }))
  })

  it('handles a simple local target', async () => {
    const result = await TaskToStartConfig({
      command: 'echo "Test"',
      baseUrl: 'http://localhost:3000/api/v1'
    })

    assert(equals(result, {
      serviceConfig:
        {
          port: 3301,
          host: 'localhost',
          protocol: 'http:',
          basePath: '/api/v1'
        },
      proxyConfig:
        {
          port: 3000,
          host: 'localhost',
          protocol: 'http:',
          basePath: '/api/v1'
        }
    }))
  })

  it('handles an https target', async () => {
    const result = await TaskToStartConfig({
      command: 'echo "Test"',
      baseUrl: 'https://local.dev:3000/api/v1'
    })

    assert(equals(result, {
      serviceConfig:
        {
          port: 3302,
          host: 'local.dev',
          protocol: 'https:',
          basePath: '/api/v1'
        },
      proxyConfig:
        {
          port: 3000,
          host: 'local.dev',
          protocol: 'https:',
          basePath: '/api/v1'
        }
    }))
  })

  it('works with proxy override', async () => {
    const result = await TaskToStartConfig({
      command: 'echo "Test"',
      baseUrl: 'https://cnn.com/api',
      proxy: 'http://localhost:3595'
    })

    assert(equals(result, {
      serviceConfig:
        {
          port: 3303,
          host: 'cnn.com',
          protocol: 'https:',
          basePath: '/api'
        },
      proxyConfig:
        {
          port: 3595,
          host: 'localhost',
          protocol: 'http:',
          basePath: '/api'
        }
    }))
  })
})
