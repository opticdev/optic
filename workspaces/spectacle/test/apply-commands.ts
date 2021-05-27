import Tap from 'tap';
import { InMemoryOpticContextBuilder } from '../src/in-memory';
import * as opticEngine from '@useoptic/optic-engine-wasm';
import { AddPathComponent, makeSpectacle } from '../src';

Tap.test(`wasm opticEngine can generate nanoid`, async (test) => {
  const result = opticEngine.next_nano_id('x');
  test.assert(result.startsWith('x'));
});
Tap.test('spectacle applyCommands mutation', async (test) => {
  const opticContext = await InMemoryOpticContextBuilder.fromEvents(
    opticEngine,
    []
  );
  const spectacle = await makeSpectacle(opticContext);
  const commands = [AddPathComponent('ppp', 'root', 'ppp')];
  await spectacle.queryWrapper({
    query: `
mutation X($commands: [JSON], $batchCommitId: ID, $commitMessage: String, $clientId: ID, $clientSessionId: ID) {
  applyCommands(commands: $commands, batchCommitId: $batchCommitId, commitMessage: $commitMessage, clientId: $clientId, clientSessionId: $clientSessionId) {
    batchCommitId
  }
}
        `,
    variables: {
      commands: commands,
      batchCommitId: 'bbb',
      commitMessage: 'mmm',
      clientId: 'iii',
      clientSessionId: 'ccc',
    },
  });
  const query = `{
      paths {
        absolutePathPattern
        absolutePathPatternWithParameterNames
        isParameterized
        name
        pathId
      }
    }`;

  const results = await spectacle.queryWrapper({ query, variables: {} });
  test.matchSnapshot(results);
});
