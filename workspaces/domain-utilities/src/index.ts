import { StableHasher } from './coverage';
import { DiffHelpers, JsonHelper, opticEngine } from '@useoptic/domain';

export { StableHasher } from './coverage';

export function universeFromEvents(events: any[]) {
  const { contexts } = opticEngine.com.useoptic;
  const { RfcServiceJSFacade } = contexts.rfc;
  const rfcServiceFacade = RfcServiceJSFacade();
  const eventStore = rfcServiceFacade.makeEventStore();
  const rfcId = 'testRfcId';
  const eventsAsJson = opticEngine.EventSerialization.fromJs(events);
  eventStore.append(rfcId, eventsAsJson);
  const rfcService = rfcServiceFacade.makeRfcService(eventStore);
  const rfcState = rfcService.currentState(rfcId);
  return {
    rfcState,
    eventStore,
    rfcId,
    rfcService,
  };
}

export function cachingResolversAndRfcStateFromEvents(events: any[]) {
  const { rfcState } = universeFromEvents(events);
  const resolvers = opticEngine.ShapesResolvers.newCachingResolver(rfcState);
  return { resolvers, rfcState };
}

export function rfcStateFromEvents(events: any[]) {
  const { rfcState } = universeFromEvents(events);
  return rfcState;
}

export function reportFromEventsAndInteractions(
  shapesResolvers: any,
  events: any[],
  interactions: any[]
) {
  const rfcState = rfcStateFromEvents(events);
  const report = opticEngine.com.useoptic.diff.helpers
    .CoverageHelpers()
    .getCoverage(shapesResolvers, rfcState, interactions);
  return report;
}

export function reportFromRfcStateAndInteractions(
  shapesResolvers: any,
  rfcState: any,
  interactions: any[]
) {
  const report = opticEngine.com.useoptic.diff.helpers
    .CoverageHelpers()
    .getCoverage(shapesResolvers, rfcState, interactions);
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
  shapesResolvers: any,
  rfcState: any,
  interactions: any[]
) {
  const diffResults = DiffHelpers.groupByDiffs(
    shapesResolvers,
    rfcState,
    deserializeInteractions(interactions)
  );
  return diffResults;
}
