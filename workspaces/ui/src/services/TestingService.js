// TODO: Consider using a TypeScript interface here
// interace ITestingService
import { opticEngine, Queries } from '@useoptic/domain';
// placeholder for actual remote service
import { StableHasher } from '../utilities/CoverageUtilities';
import { JsonHelper } from '@useoptic/domain';

export class TestingService {}

export async function createExampleTestingService(exampleId) {
  const example = await fetch(`/example-reports/${exampleId}.json`, {
    headers: {
      accept: 'application/json'
    }
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error();
  });

  const { orgId, specs, samples: samplesByCaptureId, captures } = example;

  function getSpecEvents(captureId) {
    const spec = specs[captureId];
    if (typeof spec === 'string') {
      // allow specs for one capture reference other specs, to keep example json
      // under control
      return getSpecEvents(spec);
    } else {
      return spec;
    }
  }

  function getSamples(captureId) {
    const samples = samplesByCaptureId[captureId];
    if (typeof samples === 'string') {
      // allow samples for one capture reference other samples, to keep example json
      // under control
      return getSamples(samples);
    } else {
      return samples;
    }
  }

  class ExampleTestingService {
    constructor(orgId) {
      this.orgId = orgId;
    }

    async loadSpecEvents(captureId) {
      await new Promise((r) => setTimeout(r, 200));

      return getSpecEvents(captureId);
    }

    async listCaptures() {
      await new Promise((r) => setTimeout(r, 200));
      return captures;
    }

    async loadReport(captureId) {
      await new Promise((r) => setTimeout(r, 200));
      const events = getSpecEvents(captureId);
      const samples = getSamples(captureId);
      const { rfcState } = queriesFromEvents(events);

      const samplesSeq = JsonHelper.jsArrayToSeq(
        samples.map((x) => JsonHelper.fromInteraction(x))
      );
      const converter = new opticEngine.com.useoptic.CoverageReportConverter(
        StableHasher
      );
      const report = opticEngine.com.useoptic.diff.helpers
        .CoverageHelpers()
        .getCoverage(rfcState, samplesSeq);
      const serializedReport = converter.toJs(report);
      return serializedReport;
    }
  }

  return new ExampleTestingService(orgId);
}

// Might belong in a (View)Model somewhere
export function queriesFromEvents(events) {
  const { contexts } = opticEngine.com.useoptic;
  const { RfcServiceJSFacade } = contexts.rfc;
  const rfcServiceFacade = RfcServiceJSFacade();
  const eventStore = rfcServiceFacade.makeEventStore();
  const rfcId = 'testRfcId';

  // @TODO: figure out if it's wise to stop the parsing of JSON from the response, to prevent
  // parse -> stringify -> parse
  eventStore.bulkAdd(rfcId, JSON.stringify(events));
  const rfcService = rfcServiceFacade.makeRfcService(eventStore);
  const queries = Queries(eventStore, rfcService, rfcId);
  const rfcState = rfcService.currentState(rfcId);

  return { queries, rfcState };
}
