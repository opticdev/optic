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
    # Configures the 'optic capture' flow. View the documentation for details about how capture works: DOCS_LINK_HERE
    capture:
      ${oasFile}:
        config:
          # The number of parallel requests to make when using 'requests.send'.
          # Optional: default 4
          request_concurrency: 4
        server:
          # The command to run your server.
          # Optional: If omitted, Optic assumes the server is running or started elsewhere.
          command: your-server-command
          # The url where your server can be reached once running.
          # Required: Can be overridden with '--server-override'.
          url: http://localhost:8080
          # A readiness endpoint for Optic to validate before sending requests.
          # Optional: If omitted, perform no readiness checking.
          ready_endpoint: /
          # The interval to check 'ready_endpoint', in ms.
          # Optional: default: 1000
          ready_interval: 100
          # The length of time in ms to wait for a successful ready check to occur.
          # Optional: default: 60_000, 1 minute
          ready_timeout: 60_000
        # At least one of 'requests.run' or 'requests.send' is required below.
        requests:
          # Run a command to generate traffic. Requests should be sent to the Optic proxy, the address of which is injected
          # into 'run.command's env as OPTIC_PROXY or the value of 'run.proxy_variable', if set.
          run:
            # The command that will generate traffic to the Optic proxy. Globbing with '*' is supported.
            # Required if specifying 'requests.run'.
            command: your-test-command
            # The name of the environment variable injected into the env of the command that contains the address of the Optic proxy.
            # Optional: default: OPTIC_PROXY
            proxy_variable: OPTIC_PROXY
          # Have Optic generate traffic to the proxy itself by specifying endpoint details. A request's 'data' attribute
          # is converted to JSON and sent along with the request.
          send:
            # path: Required
            # method: Optional: default GET
            # data: Optional: If omitted on a POST request, default {}
            - path: /
              method: GET
            - path: /users/create
              method: POST
              data:
                name: Hank
  `;
}
