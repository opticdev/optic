//@ts-ignore
import jsesc from 'jsesc';

export function buildTask(
  apiName: string,
  flags: any,
  taskName: string
): string {
  const config = `
name: ${escapeIt(apiName)}
tasks:
${buildInitialTask(flags, taskName)}`.trimLeft();

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
