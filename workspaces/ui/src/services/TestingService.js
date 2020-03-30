// TODO: Consider using a TypeScript interface here
// interace ITestingService

// placeholder for actual remote service
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

  const { orgId, specs, reports, captures } = example;

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
      return reports[captureId];
    }
  }

  return new ExampleTestingService(orgId);
}
