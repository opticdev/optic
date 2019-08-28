import * as keytar from 'keytar'
// @ts-ignore
import * as decodeJwt from 'jwt-decode'
// @ts-ignore
import * as niceTry from 'nice-try'

const service = 'optic'
const account = 'default' //ability to have multiple accounts will be enabled as needed

export async function getUser(): Promise<string | null> {
  const currentJwt = await keytar.getPassword(service, account) || ''
  const decoded = decode(currentJwt)
  if (decoded) {
    return decoded.sub
  } else {
    return null
  }
}

export function decode(jwt: string) {
  return niceTry(() => decodeJwt(jwt))
}

export async function saveUser(jwt: string) {
  return keytar.setPassword(service, account, jwt)
}
