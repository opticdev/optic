// @ts-ignore
import * as Analytics from 'analytics-node'
import {getUser} from "@useoptic/cli-server/build/authentication";

const analytics = new Analytics('RvYGmY1bZqlbMukS8pP9DPEifG6CEBEs', { flushAt: 1 });


const getUserPromise = getUser()

getUserPromise.then((user) => {
  if (user) {
    analytics.identify({userId: user.sub, traits: {name: user.name, email: user.email}})
  }
})

export async function track(event: string, properties: any = {}) {
  await new Promise(((resolve, reject) =>{
    getUserPromise.then(user => {
      if (user) {
        analytics.track({userId: user.sub, event, properties}, resolve);
      } else {
        analytics.track({anonymousId: 'anon', event, properties}, resolve);
      }
    })
  }))
}
