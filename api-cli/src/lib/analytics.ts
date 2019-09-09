import * as Mixpanel from 'mixpanel'
//@ts-ignore
import {hri} from 'human-readable-ids'
import {getUser} from './credentials'
//@ts-ignore
import * as fetch from 'node-fetch'

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

  constructor(token: string) {
    if (!token) {
      throw new Error('missing mixpanel token')
    }
    this.client = Mixpanel.init(token)
    this.distinct_id = 'anon_' + hri.random()
    getUser().then(userId => {
      if (userId) {
        this.distinct_id = userId
      }
    })
  }

  track(_event: string, _properties: IAnalyticsProperties = {}): void {
    this.client.track(_event, {..._properties, distinct_id: this.distinct_id})
    //console.log(_event, {..._properties, distinct_id: this.distinct_id})
  }
}

export function trackSlack(event: string, data: any = {}) {
  fetch('https://ayiz1s0f8f.execute-api.us-east-2.amazonaws.com/production/log/slack', {
    method: 'POST',
    headers: {},
    body: JSON.stringify({text: `${event} ${JSON.stringify(data)}`, distinct_id: analytics.distinct_id})
  })
}

const providers: { [key: string]: any } = {
  mixpanel: () => new MixpanelAnalytics(process.env.MIXPANEL_TOKEN as string || '78a42ccba0e9a55de00c30b454c5da8e'),
  null: () => new NullAnalytics()
}
const analyticsProviderFactory = providers[process.env.ANALYTICS_IMPL || 'mixpanel'] || providers.null
const analytics = analyticsProviderFactory()

export default analytics
