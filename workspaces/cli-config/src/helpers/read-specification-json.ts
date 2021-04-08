import fs from "fs-extra";
import colors from 'colors';
export async function getSpecEventsFrom(specStorePath: string): Promise<any[]> {
  const rawSpecFileJson = await fs.readFile(specStorePath,  'utf8');
  const events = await resolveConflictsIfPresent(rawSpecFileJson, specStorePath)
  return events
}

export async function resolveConflictsIfPresent(contents: string, specStorePath: string, dryRun: boolean = false): Promise<any[]> {

  const lines = contents.split('\n')

  const startRegex = /\<\<\<\<\<\<\< (.*)/
  const sep = /\=\=\=\=\=\=\=/
  const endRegex = /\>\>\>\>\>\>\> (.*)/

  let baseBranch;
  let headBranch;

  const startLine = lines.findIndex(i => {
    const match = i.match(startRegex)
    if (match) {
      baseBranch = match[1]
      return true
    } else return false
  })
  const sepLine = lines.findIndex(i => {
    const match = i.match(sep)
    return Boolean(match)
  })

  const endLine = lines.findIndex(i => {
    const match = i.match(endRegex)
    if (match) {
      headBranch = match[1]
      return true
    } else return false
  })

  if (startLine !== -1 && sepLine !== -1 && endLine !== -1) {
    console.log(`${colors.cyan('[optic]')} specification.json conflict detected. merging ${baseBranch} ${headBranch}`)
    const toRemove = [startLine, sepLine, endLine]
    const newEvents = JSON.parse(lines.filter((i, index) => !toRemove.includes(index)).join('\n'))
    if (!dryRun) {
      await fs.writeFile(specStorePath, prepareEvents(newEvents),  'utf8');
    }
    return newEvents
  } else {
    return JSON.parse(contents)
  }
}



// format event string
export function prepareEvents(events: any): string {
  return `[
${events.map((x: any) => JSON.stringify(x)).join('\n,')}
]`;
}
