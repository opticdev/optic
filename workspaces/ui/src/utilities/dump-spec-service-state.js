export function dumpSpecServiceState(specService) {
  return async function (options) {
    const {
      outputFileName,
      downloadSourcePath,
      downloadDestinationPath
    } = options;

    const events = await specService.listEvents();
    const captures = await specService.listCaptures();
    const captureId = captures.captures[0];
    const session = await specService.listCapturedSamples(captureId);

    const output = JSON.stringify({
      events: JSON.parse(events),
      session,
      examples: {}
    }, null, 2);

    const blob = new Blob([output], {type: 'application/json'});

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = outputFileName;
    console.log(link);
    link.click()
    return `mv "${downloadSourcePath}/${outputFileName}" "${downloadDestinationPath}/${outputFileName}`
  };
}