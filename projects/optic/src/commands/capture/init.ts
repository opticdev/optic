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
    # Complete reference documentation for this configuration file is available:
    #   https://github.com/opticdev/optic/wiki/Using-Optic-Capture-with-Integration-Tests

    # Run with "optic capture ${oasFile} --update interactive"
    server:
      url: https://echo.o3c.org
    requests:
      send: 
        - path: /users
          headers:
            x-response-json: '[{"id":0, "name":"aidan"}]'
        - path: /users/create
          method: POST
          data:
            name: nic
          headers:
            x-response-json: '{"id":1, "name":"nic"}'
            x-response-code: "201"
  `;
}
