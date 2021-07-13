import { CheckResults } from './runner';

export function basicReport(results: CheckResults) {
  if (results.hasFailures()) {
    const failures = results.all().map((result) => `- ${result}`);
    return `API checks failed\n${failures}`;
  } else {
    return 'All API checks passed';
  }
}
