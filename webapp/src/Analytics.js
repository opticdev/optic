import mixpanel from 'mixpanel-browser'
let isAnalyticsEnabled = process.env.REACT_APP_ENABLE_ANALYTICS !== 'no'

const init = () => mixpanel.init('78a42ccba0e9a55de00c30b454c5da8e');

if (isAnalyticsEnabled) {
  if (!window.localStorage.getItem('_known_user')) {
    init()
    window.localStorage.setItem('_known_user', 'true')
    const slack = "hNIv7B71oyUuRlczOFGqzRY3/ZFRBVM6NB/XDT4MQLFT".split("").reverse().join("")
    fetch('https://hooks.slack.com/services/'+slack, {
      method: 'POST',
      headers: {},
      body: JSON.stringify({ text: 'New User with mixpanel ID: ' + mixpanel.persistence.props.distinct_id })
    })
  }
  if (process.env.REACT_APP_CLI_MODE) {
    fetch(`/cli-api/identity`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then(({ distinctId, doNotTrack }) => {
        if (!doNotTrack) {
          init()
          mixpanel.identify(distinctId)
          window.FS.identify(distinctId);
          window.FS.identify(distinctId);
          track('Opened on Local')
        } else {
          window.FS.shutdown()
          isAnalyticsEnabled = false
        }
      });
  }
} else {
  console.warn('Analytics is disabled')
}

export function track(event, props) {
  if (isAnalyticsEnabled) {
    mixpanel.track(event, props)
  }
}

window.AnalyticsJsStub = {
  track: (event, props) => {
    track(event, props)
  }
}
