import { opticEngine, Queries } from '@useoptic/domain';

export interface DiffRfcBaseState {
  eventStore: any;
  rfcState: any;
  rfcService: any;
  rfcId: string;
  queries: any;
  domainIdGenerator: {
    newShapeId: () => string;
    newPathId: () => string;
    newRequestId: () => string;
    newResponseId: () => string;
    newShapeParameterId: () => string;
    newRequestParameterId: () => string;
    newFieldId: () => string;
  };
}

export function makeDiffRfcBaseState(
  eventStore: any,
  rfcService: any,
  rfcId: string,
  domainIdGenerator: any = opticEngine.com.useoptic.OpticIdsJsHelper().random
): DiffRfcBaseState {
  const queries = Queries(eventStore, rfcService, rfcId);

  return {
    queries,
    eventStore,
    rfcService,
    rfcId,
    domainIdGenerator,
    rfcState: rfcService.currentState(rfcId),
  };
}
