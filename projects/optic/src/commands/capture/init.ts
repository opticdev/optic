import yaml from 'yaml';
import { updateOpticConfig } from '../../utils/write-optic-config';
import { logger } from '../../logger';

export async function initCaptureConfig(
  oasFile: string,
  skipConfigUpdate: boolean,
  opticConfigPath: string
) {
  const captureExample = captureConfigExample(oasFile);
  const parsedExample = yaml.parseDocument(captureExample);

  if (skipConfigUpdate) {
    // console.log() to skip any future formatting changes we might make to logger
    console.log(parsedExample.toString());
    return;
  }
  logger.info(`Writing capture config to ${opticConfigPath}`);
  try {
    await updateOpticConfig(parsedExample, opticConfigPath);
  } catch (err) {
    throw err;
  }
}

// returns a complete Capture block example
export function captureConfigExample(oasFile: string) {
  return `
    capture:
      ${oasFile}:
        config:
          # the number of parallel requests to make when using 'requests.send'
          # optional, default: 4
          request_concurrency: 4
        server:
          # a command to run your server
          # optional. if omitted Optic assumes the server is running or started elsewhere
          command: your-server-command
          # the url where your server can be reached once running
          # required, can be overridden with '--server-override'
          url: http://localhost:8080
          # a readiness endpoint for Optic to validate before sending requests
          # optional. if omitted perform no readiness checking.
          ready_endpoint: /
          # the interval to check ready_endpoint in ms
          # optional, default: 1000
          ready_interval: 100
          # the length of time in ms to wait for a successful ready check to occur
          # optional, default: 60_000 (1 minute)
          ready_timeout: 60_000
        # at least one of requests.run or requests.send is required below
        requests:
          # run a command to generate traffic. requests should be sent to the Optic proxy, the address of which is injected
          # into 'run.command's env as OPTIC_PROXY or the value of 'run.proxy_variable', if set.
          run:
            # the command that will generate traffic to the Optic proxy. the commands are running in a shell that supports globbing.
            # required if specifying requests.run
            command: your-test-command
            # the name of the environment variable injected into the env of the command that contains the address of the Optic proxy
            # default: OPTIC_PROXY
            proxy_variable: OPTIC_PROXY
          # have Optic generate traffic to the proxy itself by specifying endpoint details. a request's 'data' attribute
          # is converted to JSON and sent along with the request.
          send:
            # path: required
            # method: optional, default: GET
            - path: /
              method: GET
            - path: /users/create
              method: POST
              # optional, if omitted on a POST, default: {}
              data:
                name: Hank
  `;
}
