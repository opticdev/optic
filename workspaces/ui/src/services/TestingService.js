// TODO: Consider using a TypeScript interface here
// interace ITestingService
import { opticEngine } from '@useoptic/domain';
// placeholder for actual remote service
import { specFromEvents } from '../components/dashboards/TestingDashboard';
import { StableHasher } from '../utilities/CoverageUtilities';
import { JsonHelper } from '@useoptic/domain';

export class TestingService {}

export async function createExampleTestingService(
  exampleUrl = '/example-reports/todo-report.json'
) {
  const example = await fetch(exampleUrl, {
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

  function getSpec(captureId) {
    const spec = specs[captureId];
    if (typeof spec === 'string') {
      // allow specs for one capture reference other specs, to keep example json
      // under control
      return getSpec(spec);
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

    async loadSpec(captureId) {
      await new Promise((r) => setTimeout(r, 200));

      return getSpec(captureId);
    }

    async listCaptures() {
      await new Promise((r) => setTimeout(r, 200));
      return captures;
    }

    async loadReport(captureId) {
      await new Promise((r) => setTimeout(r, 200));
      const events = getSpec(captureId);
      const samples = getSamples(captureId);
      const { rfcState } = specFromEvents(events);

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
