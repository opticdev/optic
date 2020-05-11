import * as deepCopy from 'deepcopy';

export function debugDump(specService, captureId) {
  return async function () {
    const events = await specService.listEvents();
    const session = await specService.listCapturedSamples(captureId);
    const sessionCleaned = deepCopy(session);

    console.log('sanitizing data...');
    sessionCleaned.samples.forEach((i) => {
      i.request.body.value.asJsonString = null;
      i.request.body.value.asText = null;

      i.response.body.value.asJsonString = null;
      i.response.body.value.asText = null;
    });

    const output = JSON.stringify({
      events: JSON.parse(events),
      session: sessionCleaned,
      examples: {},
    });

    const blob = new Blob([output], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-capture-${captureId}.json`;
    console.log(link);
    link.click();
  };
}
