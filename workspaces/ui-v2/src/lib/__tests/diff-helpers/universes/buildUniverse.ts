import { InMemoryOpticContextBuilder } from '@useoptic/spectacle/build/in-memory';
import * as opticEngine from '@useoptic/diff-engine-wasm/engine/build/';
import { IOpticContext, makeSpectacle } from '@useoptic/spectacle';
import { makeCurrentSpecContext } from '<src>/lib/__tests/diff-helpers/universes/makeCurrentSpecContext';
import { CurrentSpecContext } from '<src>/lib/Interfaces';

export type ITestUniverse = {
  opticContext: IOpticContext;
  currentSpecContext: CurrentSpecContext;
  spectacleQuery: any;
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

  return {
    opticContext,
    //@ts-ignore
    spectacleQuery: { query: spectacle.queryWrapper },
    currentSpecContext,
  };
}
