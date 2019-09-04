import mixpanel from 'mixpanel-browser'

const isAnalyticsEnabled = process.env.REACT_APP_ENABLE_ANALYTICS !== 'no'
if (isAnalyticsEnabled) {
  mixpanel.init('78a42ccba0e9a55de00c30b454c5da8e');
  if (!window.localStorage.getItem('_known_user')) {
    window.localStorage.setItem('_known_user', 'true')
    fetch('https://hooks.slack.com/services/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', {
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
      .then(({ distinctId }) => {
        mixpanel.identify(distinctId)
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
