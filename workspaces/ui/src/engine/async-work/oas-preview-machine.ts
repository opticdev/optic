import { expose } from 'threads/worker';
import { OasProjectionHelper } from '@useoptic/domain';

expose({
  oasPreviewMachine,
});

export interface IOasStats {
  oasLineCount: number;
  responses: any;
  requests: any;
  fields: any;
}

function oasPreviewMachine(events: any[]): IOasStats {
  const oas = OasProjectionHelper.fromEventString(JSON.stringify(events));
  return {
    fields: events.reduce(
      (sum, event) => (event.FieldAdded ? sum + 1 : sum),
      0
    ),
    requests: events.reduce(
      (sum, event) => (event.RequestAdded ? sum + 1 : sum),
      0
    ),
    responses: events.reduce(
      (sum, event) =>
        event.ResponseAdded || event.ResponseAddedByPathAndMethod
          ? sum + 1
          : sum,
      0
    ),
    oasLineCount: JSON.stringify(oas, null, 4).split('\n').length,
  };
}
