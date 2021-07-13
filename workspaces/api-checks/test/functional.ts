import * as fs from 'fs';
import Tap from 'tap';
import { EndpointChangeChecks, Spectacle, checks, reports } from '../src/';

Tap.test('Successful check', async (test) => {
  const endpointChanges = await initEndpointChanges();
  // The ./specification.json has a 404 in the only GET endpoint
  // This makes this test pass
  endpointChanges.on('added', checks.requireNotFoundWithGet);
  const results = await endpointChanges.run();
  test.matchSnapshot(reports.basicReport(results));
});

Tap.test('Failing check', async (test) => {
  const endpointChanges = await initEndpointChanges();
  endpointChanges.on('added', async () => 'Failing check');
  const results = await endpointChanges.run();
  test.matchSnapshot(reports.basicReport(results));
});

async function initEndpointChanges() {
  const events = JSON.parse(
    fs.readFileSync('./test/specification.json').toString()
  );
  const spectacle = await Spectacle.fromEvents(events);
  return new EndpointChangeChecks({
    // This is from the first batch commit in the ./specification.json file
    sinceBatchCommitId: 'a2210088-b48c-44aa-853d-fece5e924482',
    spectacle,
  });
}
