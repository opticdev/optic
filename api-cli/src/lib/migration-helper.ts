import * as colors from 'colors'
import * as findUp from 'find-up'
import {fromOptic} from './log-helper'

export async function checkFor6to7() {
  if (await findUp('.api/spec-store.json', {type: 'file'}) && !await findUp('optic.yml', {type: 'file'})) {
    console.log(fromOptic(`Optic >=7 replaced the ${colors.blue('.api')} folder with a ${colors.green('.optic')} folder.\n Read full migration guide here.`))
    return true
  }
}
