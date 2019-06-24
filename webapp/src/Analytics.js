import mixpanel from 'mixpanel-browser'
mixpanel.init('78a42ccba0e9a55de00c30b454c5da8e');

export function track(event, props) {
	mixpanel.track(event, props)
}
