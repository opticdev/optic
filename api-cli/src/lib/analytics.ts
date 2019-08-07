import * as Mixpanel from 'mixpanel'
//@ts-ignore
import { hri } from 'human-readable-ids'

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
    client: Mixpanel.Mixpanel;
    distinct_id: string;
    constructor(token: string) {
        if (!token) {
            throw new Error('missing mixpanel token')
        }
        this.client = Mixpanel.init(token);
        this.distinct_id = hri.random() //@ENHANCEMENT in the future, this could come from the git email address, for example.
    }
    track(_event: string, _properties: IAnalyticsProperties = {}): void {
        this.client.track(_event, { ..._properties, distinct_id: this.distinct_id })
        //console.log(_event, {..._properties, distinct_id: this.distinct_id})
    }
}

const providers: { [key: string]: any } = {
    mixpanel: () => new MixpanelAnalytics(process.env.MIXPANEL_TOKEN as string),
    null: () => new NullAnalytics()
}
const analyticsProviderFactory = providers[process.env.ANALYTICS_IMPL || 'null'] || providers.null
const analytics = analyticsProviderFactory()

export default analytics
