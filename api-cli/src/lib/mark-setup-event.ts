import * as path from 'path'
import * as fs from 'fs-extra'
import {prepareEvents} from '../PersistUtils'
export async function markSetupStage(step: string, specStorePath: string) {
  const events = fs.readJsonSync(specStorePath)
  // @ts-ignore
  const alreadyLogged = events.find(i => i.SetupStepReached && i.SetupStepReached.step === step)
  if (!alreadyLogged) {
    events.push({SetupStepReached: {step}})
    await fs.writeFile(specStorePath, prepareEvents(events))
  }
}
