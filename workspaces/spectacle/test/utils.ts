import * as fs from 'fs';

export function loadEvents(file: string) {
  return JSON.parse(fs.readFileSync(file).toString('utf-8'));
}
