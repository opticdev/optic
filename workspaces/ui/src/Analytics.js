let isAnalyticsEnabled = process.env.REACT_APP_ENABLE_ANALYTICS !== 'no'

const readyPromise = new Promise(resolve => {
  // if (isAnalyticsEnabled) {
  if (true) {
    if (process.env.REACT_APP_CLI_MODE) {
      fetch(`/identity`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((res) => res.json())
        .then((user) => {
          resolve(user)
          window.FS.identify(user.sub, {
            displayName: user.name,
            email: user.email
          });
          window.analytics.identify(user.sub, {
            name: user.name,
            email: user.email
          });
        })
        .catch(() => {
          console.log('no user')
          resolve()
        })
    }
  } else {
    console.warn('Analytics is disabled')
    try {
      window.FS.shutdown()
    } catch(e) {

    }
    resolve()
  }
})

export function touchAnalytics() {
  readyPromise.then(() => console.log('analytics loaded'))
}

export function track(event, props) {
  if (isAnalyticsEnabled) {
    readyPromise.then((user) => {
      if (isAnalyticsEnabled) {
        window.analytics.track(event, props);
      }
    })
  }
}

window.AnalyticsJsStub = {
  track: (event, props) => {
    track(event, props)
  }
}
