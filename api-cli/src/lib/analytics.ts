import * as Mixpanel from 'mixpanel'
//@ts-ignore
import {hri} from 'human-readable-ids'
//@ts-ignore
import * as fetch from 'node-fetch'
import {readLocalConfig, setDoNotTrack} from './identity'
import * as os from 'os'

interface IAnalyticsProperties {
  [key: string]: any
}

interface IAnalytics {
  track(event: string, properties?: IAnalyticsProperties): void
}

class NullAnalytics implements IAnalytics {
  public track(_event: string, _properties: IAnalyticsProperties): void {

  }
}

class MixpanelAnalytics implements IAnalytics {
  client: Mixpanel.Mixpanel
  distinct_id: string
  doNotTrack: boolean

  constructor(token: string) {
    if (!token) {
      throw new Error('missing mixpanel token')
    }
    this.client = Mixpanel.init(token)
    const {user_id, doNotTrack} = readLocalConfig()
    this.distinct_id = user_id
    this.doNotTrack = doNotTrack
  }

  track(_event: string, _properties: IAnalyticsProperties = {}): Promise<void> {
    if (this.doNotTrack) {
      return Promise.resolve()
    }
    return new Promise(resolve => {
      this.client.track(_event, {..._properties, distinct_id: this.distinct_id}, () => {
        resolve()
      })
    })
  }

  trackInstall(parentArgs: any) {
    const doNotTrack = process.env.DO_NOT_TRACK === 'true'
    if (doNotTrack) {
      setDoNotTrack()
    }
    const properties = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      doNotTrack,
      opticVersion: require('../../package.json').version
    }
    this.client.track('Install CLI', {...properties, distinct_id: this.distinct_id})
  }
}

const providers: { [key: string]: any } = {
  mixpanel: () => new MixpanelAnalytics(process.env.MIXPANEL_TOKEN as string || '78a42ccba0e9a55de00c30b454c5da8e'),
  null: () => new NullAnalytics()
}
const analyticsProviderFactory = providers[process.env.ANALYTICS_IMPL || 'mixpanel'] || providers.null
const analytics = analyticsProviderFactory()

export function trackSlack(event: string, data: any = {}) {
  fetch('https://ayiz1s0f8f.execute-api.us-east-2.amazonaws.com/production/log/slack', {
    method: 'POST',
    headers: {},
    body: JSON.stringify({text: `${event} ${JSON.stringify(data)}`, distinct_id: analytics ? analytics.distinct_id : 'anon'})
  })
}
export default analytics
