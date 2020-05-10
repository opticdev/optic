import { StableHasher } from './coverage';
import { JsonHelper, opticEngine } from '@useoptic/domain';

export { StableHasher } from './coverage';

export function rfcStateFromEvents(events: any[]) {
  const { contexts } = opticEngine.com.useoptic;
  const { RfcServiceJSFacade } = contexts.rfc;
  const rfcServiceFacade = RfcServiceJSFacade();
  const eventStore = rfcServiceFacade.makeEventStore();
  const rfcId = 'testRfcId';

  const stringifiedEvents = JSON.stringify(events);
  eventStore.bulkAdd(rfcId, stringifiedEvents);
  const rfcService = rfcServiceFacade.makeRfcService(eventStore);
  const rfcState = rfcService.currentState(rfcId);

  return rfcState;
}

export function reportFromEventsAndInteractions(
  events: any[],
  interactions: any[]
) {
  const rfcState = rfcStateFromEvents(events);
  const report = opticEngine.com.useoptic.diff.helpers
    .CoverageHelpers()
    .getCoverage(rfcState, interactions);
  return report;
}

export function serializeReport(report: any) {
  const converter = new opticEngine.com.useoptic.CoverageReportConverter(
    StableHasher
  );
  return converter.toJs(report);
}

export function deserializeInteractions(serializedInteractions: any) {
  const parsedInteractions = serializedInteractions.map((x: object) =>
    JsonHelper.fromInteraction(x)
  );
  const parsedInteractionsSeq = JsonHelper.jsArrayToSeq(parsedInteractions);
  return parsedInteractionsSeq;
}

export function diffFromRfcStateAndInteractions(
  rfcState: any,
  interactions: any[]
) {
  const diffResults = opticEngine.com.useoptic.diff.helpers
    .DiffHelpers()
    .groupByDiffs(rfcState, deserializeInteractions(interactions));
  console.log({ diffResults });
  return diffResults;
}
