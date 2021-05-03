import { CliServer } from './server';
import { Client } from '@useoptic/cli-client';
async function main() {
  const apiServer = new CliServer({
    cloudApiBaseUrl: 'fixme',
  });
  const serverState = await apiServer.start();
  console.log({ serverState });
  const cliClient = new Client(`http://localhost:${serverState.port}/api`);
  await cliClient.findSession(
    '/Users/dev/work/optic-testing/blank', //@jaap: put a valid path here, or change how it works, etc.
    null,
    null
  );
}

main();
