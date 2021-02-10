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
  clientId: string,
  commitMessage: string
): { newEvents: any[]; updatedEvents: any[] } {
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

  const parsedEvents = JSON.parse(eventString);

  const {
    rfcId,
    eventStore,
  } = universeFromEventsAndAdditionalCommands(parsedEvents, commandContext, [
    StartBatchCommit(batchId, commitMessage),
    ...inputCommands,
    EndBatchCommit(batchId),
  ]);

  const parsedNewEvents = JSON.parse(eventStore.serializeEvents(rfcId));

  const onlyNewEvents = parsedNewEvents.slice(parsedEvents.length);

  return {
    newEvents: onlyNewEvents,
    updatedEvents: parsedNewEvents,
  };
}
