import yaml from 'yaml';
import { updateOpticConfig } from '../../utils/write-optic-config';
import { OpticCliConfig } from '../../config';

export async function initCaptureConfig(
  oasFile: string,
  skipConfigUpdate: boolean,
  config: OpticCliConfig
): Promise<string | undefined> {
  const captureExample = captureConfigExample(oasFile, skipConfigUpdate);
  const parsedExample = yaml.parseDocument(captureExample);

  if (skipConfigUpdate) {
    // console.log() to skip any future formatting changes we might make to logger
    console.log(parsedExample.toString());
    console.log('');
    return;
  }

  return updateOpticConfig(parsedExample, oasFile, config);
}

// returns a complete Capture block example
export function captureConfigExample(
  oasFile: string,
  skipConfigUpdate: boolean
) {
  return `
${skipConfigUpdate ? `capture:\n  ${oasFile}:` : ''}
    server:
      # 🔧 Update this to the command to run your server.
      # Optional: If omitted, Optic assumes the server is running or started elsewhere.
      command: your-server-command
      # 🔧 Update this url to where your server can be reached.
      # Required: Can be overridden with '--server-override'.
      url: http://localhost:8080
      # 🔧 Update the readiness endpoint for Optic to validate before sending requests.
      # Optional: If omitted, perform no readiness checking.
      ready_endpoint: /

    # 🔧 Specify either 'requests.run' or 'requests.send' to generate requests to hit your server
    requests:
      # ℹ️ Requests should be sent to the Optic proxy, the address of which is injected into 'run.command's env as OPTIC_PROXY (or the value of 'run.proxy_variable').
      run:
        # 🔧 Specify a command that will generate traffic
        command: your-test-command
        # 🔧 OPTIC_PROXY is added to your command's env and contains the URL of an Optic's local reverse proxy. Your command should send its requests to this URL.
        proxy_variable: OPTIC_PROXY
      # 🔧 Or instead, craft requests for Optic send to your server
      send:
        - path: /
          method: GET
        - path: /users/create
          method: POST
          headers:
            content-type: application/json;charset=UTF-8
          data:
            name: Hank
  `;
}
