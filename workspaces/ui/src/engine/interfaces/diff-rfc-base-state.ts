import { Queries } from '@useoptic/domain';

export interface DiffRfcBaseState {
  eventStore: any;
  rfcState: any;
  rfcService: any;
  rfcId: string;
  queries: any;
}

export function makeDiffRfcBaseState(
  eventStore: any,
  rfcService: any,
  rfcId: string
): DiffRfcBaseState {
  const queries = Queries(eventStore, rfcService, rfcId);

  return {
    queries,
    eventStore,
    rfcService,
    rfcId,
    rfcState: rfcService.currentState(rfcId),
  };
}
