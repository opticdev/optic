import yaml from 'yaml';
import { CaptureConfigData } from '../../config';

export function initCaptureConfig(oasFile: string) {
  const captureExample = captureConfigExample(oasFile);

  console.log(yaml.parseDocument(captureExample).toString());
}

// returns a complete CaptureConfigData object
export function captureConfigExample(oasFile: string) {
  return `
    capture:
      ${oasFile}: 
        config:
         request_concurrency: 4       # optional, default: 4
        server:
          command: go run main.go     # optional, if ommitted Optic assumes the server is running or started elsewhere.
          url: http://localhost:8080  # required, can be overriden with '--server-override'
          ready_endpoint: /           # optional, default: /
          ready_interval: 100         # optional, ms, default: 1000
          ready_timeout: 60_000       # optional, ms, default 60_000 (1 minute)
        requests:
          # run a command to generate traffic. requests should be sent to the Optic proxy, the address of which is injected
          # into the 'run.command's env as OPTIC_PROXY or the value of 'run.proxy_variable', if set.
          run:                               # optional
            command: hurl hurl/*.hurl        # required if 'run' is specified
            proxy_variable: HURL_OPTIC_PROXY # optional, default: OPTIC_PROXY
          # have Optic generate traffic to the proxy itself by specifying endpoint details. a request's 'data' attribute
          # is converted to JSON and sent along with the request.
          send:
            - path: /
            - path: /users
            - path: /users/create  # required
              method: POST         # optional, default: GET
              data:                # optional, default: {}
                name: Hank         # converted to {"name:"Hank"}
  `;
}
