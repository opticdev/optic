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
    # 🔧 Runnable example with simple get requests. 
    # Run with "optic capture ${oasFile} --update interactive" 
    # You can change the server and the 'requests' section to experiment
    server:
      url: https://api.github.com
    requests:
      send: 
      - path: /users/mojombo
        method: GET
      - path: /users/defunkt
        method: GET
      - path: /users/pjhyett/repos
        method: GET
      - path: /users/pjhyett/followers
        method: GET
      - path: /orgs/opticdev/repos
        method: GET   
      - path: /orgs/facebook/repos
        method: GET   
    # When you are ready, set up an actual integration that run your test suite
    # Read reference docs here: https://www.useoptic.com/docs/capturing-traffic#configuration-reference
    # server:
    #   # 🔧 Update this to the command to run your server.
    #   # Optional: If omitted, Optic assumes the server is running or started elsewhere.
    #   command: npm dev 
    #   # 🔧 Update this url to where your server can be reached.
    #   url: http://localhost:8080
    # requests:
    #   # ℹ️ Requests should be sent to the Optic proxy, the address of which is injected into 'run.command's env as OPTIC_PROXY (or the value of 'run.proxy_variable').
    #   run:
    #     # 🔧 Specify a command that will generate traffic
    #     command: test
    #     # 🔧 OPTIC_PROXY is added to your command's env and contains the URL of an Optic's local reverse proxy. Your command should send its requests to this URL.
    #     proxy_variable: OPTIC_PROXY
  `;
}
