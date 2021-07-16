import { CliServer } from './server';
import { Client } from '@useoptic/cli-client';

async function main(inputs: { opticProjectDirectory: string }) {
  const apiServer = new CliServer({
    cloudApiBaseUrl: 'fixme',
  });
  const serverState = await apiServer.start();
  const baseUrl = `http://localhost:${serverState.port}/api`;
  console.log(`server started on ${baseUrl}`);
  const cliClient = new Client(baseUrl);
  const x = await cliClient.findSession({ path: inputs.opticProjectDirectory });
  console.log(`navigate to http://localhost:3000/apis/${x.session.id}`);
}

const [, , opticProjectDirectory] = process.argv;
main({ opticProjectDirectory });
