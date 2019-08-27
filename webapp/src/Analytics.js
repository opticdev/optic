import mixpanel from 'mixpanel-browser'

if (process.env.REACT_APP_ENABLE_ANALYTICS === 'no') {
    console.warn('Analytics is disabled')
} else {
    mixpanel.init('78a42ccba0e9a55de00c30b454c5da8e', { api_host: 'https://data.useoptic.com' });
    window.mixpanel = mixpanel
}

export function track(event, props) {
    if (process.env.REACT_APP_ENABLE_ANALYTICS !== 'no') {
        mixpanel.track(event, props)
    }
}

if (process.env.REACT_APP_ENABLE_ANALYTICS !== 'no') {
    if (!window.localStorage.getItem('_known_user')) {
        track('New User!')
        window.localStorage.setItem('_known_user', 'true')
    }
}
