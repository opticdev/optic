//@ts-ignore
import jsesc from 'jsesc';

export function buildTask(
  apiName: string,
  flags: any,
  taskName: string
): string {
  const config = `
name: ${escapeIt(apiName)}
# Start your api with Optic by running 'api run <taskname>'
tasks:
${buildInitialTask(flags, taskName)}

# Capture traffic from a deployed api by running 'api intercept <environment-name>'
# pass '--chrome' to capture from your browser's network tab
environments:
  production:
    host: https://api.github.com # the hostname of the API we should record traffic from
    webUI: https://api.github.com/repos/opticdev/optic # the url that should open when a browser flag is passed
`.trimLeft();

  return config;
}

export const defaultCommandInit =
  'echo "Setup A Valid Command to Start your API!"';

function buildInitialTask(flags: any, taskName: string) {
  //default config and valid for start injected
  let commandConfig = `  ${taskName}:
     command: ${escapeIt(flags.command || defaultCommandInit)}
     inboundUrl: ${flags.inboundUrl || 'http://localhost:4000'}
`.trimRight();

  if (flags.inboundUrl && flags.targetUrl) {
    commandConfig = `  ${taskName}:
     inboundUrl: ${flags.inboundUrl}
     targetUrl: ${flags.targetUrl}
`.trimRight();
  }

  return commandConfig;
}

function escapeIt(value: string): string {
  const escaped = jsesc(value, { quotes: 'double' });
  if (escaped !== value) {
    return `"${escaped}"`;
  }
  return `"${value}"`;
}
