import { InMemoryOpticContextBuilder } from '@useoptic/spectacle/build/in-memory';
import * as opticEngine from '@useoptic/optic-engine-wasm';
import { IOpticContext, makeSpectacle } from '@useoptic/spectacle';
import { makeCurrentSpecContext } from '<src>/lib/__tests/diff-helpers/universes/makeCurrentSpecContext';
import { CurrentSpecContext } from '<src>/lib/Interfaces';
import { v4 as uuidv4 } from 'uuid';

export type ITestUniverse = {
  opticContext: IOpticContext;
  currentSpecContext: CurrentSpecContext;
  spectacleQuery: any;
  forkSpectacleWithCommands: any;
};

export async function buildUniverse(universe_raw: {
  session: { samples: any[] };
  events: any[];
}): Promise<ITestUniverse> {
  const opticContext = await InMemoryOpticContextBuilder.fromEventsAndInteractions(
    opticEngine,
    universe_raw.events,
    universe_raw.session.samples,
    'example-session'
  );
  const spectacle = await makeSpectacle(opticContext);
  const currentSpecContext = await makeCurrentSpecContext(
    universe_raw.events,
    spectacle.queryWrapper
  );

  async function forkSpectacleWithCommands(commands: any[]) {
    const simulated = await makeSpectacle(opticContext);
    await simulated.queryWrapper({
      query: `
mutation X($commands: [JSON], $batchCommitId: ID, $commitMessage: String, $clientId: ID, $clientSessionId: ID) {
  applyCommands(commands: $commands, batchCommitId: $batchCommitId, commitMessage: $commitMessage, clientId: $clientId, clientSessionId: $clientSessionId) {
    batchCommitId
  }
}
        `,
      variables: {
        commands: commands,
        batchCommitId: uuidv4(),
        commitMessage: 'proposed changes',
        clientId: 'dev', //@dev: fill this in
        clientSessionId: 'ccc', //@dev: fill this in
      },
    });

    return simulated;
  }

  return {
    opticContext,
    forkSpectacleWithCommands,
    //@ts-ignore
    spectacleQuery: { query: spectacle.queryWrapper },
    currentSpecContext,
  };
}
