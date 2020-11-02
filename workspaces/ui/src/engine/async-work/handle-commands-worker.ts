import { expose } from 'threads/worker';
import { opticEngine, RfcCommandContext, JsonHelper } from '@useoptic/domain';
import { universeFromEventsAndAdditionalCommands } from '@useoptic/domain-utilities';

expose({
  handleCommands,
});

function handleCommands(
  commands: any[],
  eventString: string,
  batchId: string,
  clientSessionId: string,
  clientId: string
): any[] {
  const {
    universeFromEventsAndAdditionalCommands,
  } = require('@useoptic/domain-utilities');

  const {
    StartBatchCommit,
    EndBatchCommit,
  } = opticEngine.com.useoptic.contexts.rfc.Commands;

  const inputCommands = JsonHelper.vectorToJsArray(
    opticEngine.CommandSerialization.fromJs(commands)
  );

  const commandContext = new RfcCommandContext(
    clientId,
    clientSessionId,
    batchId
  );

  const { rfcId, eventStore } = universeFromEventsAndAdditionalCommands(
    JSON.parse(eventString),
    commandContext,
    inputCommands
  );

  return JSON.parse(eventStore.serializeEvents(rfcId));
}
