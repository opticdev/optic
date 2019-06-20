// @ts-ignore
import * as stringify from 'json-stable-stringify'

export function prepareEvents(events: any[]) {
  const arrayContents = events.map(i => stringify(i)).join(',\n')
  return `[\n${arrayContents}\n]`
}
