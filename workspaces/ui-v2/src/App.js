import React, { useCallback } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { appTheme } from './optic-components/theme';
import { BrowserRouter, Route } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import * as SupportLinks from './optic-components/SupportLinks';

class App extends React.Component {
  state = { hasError: false };

  render() {
    const { hasError, error } = this.state;

    if (hasError) return <AppError error={error} />;

    return (
      <React.Fragment>
        <CssBaseline />
        <ThemeProvider theme={appTheme}>
          <BrowserRouter>
            <>
              <Route path="/" component={this.props.topLevelRoutes} />
            </>
          </BrowserRouter>
        </ThemeProvider>
      </React.Fragment>
    );
  }
  // Life cycle methods
  // ------------------
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }
}

function AppError(props) {
  const onClickRefresh = useCallback((e) => {
    e.preventDefault();
    window && window.location && window.location.reload(true);
  }, []);

  // we have to be as conservative as possible here and only use styles from App.css, as we're not sure what subsystems this error has touched
  return (
    <div className="app-error-container">
      <div className="app-error">
        <h1>There was a problem in displaying the Optic app.</h1>

        <h4>
          Something that we didn't anticipate happened, and we can't recover
          from it automatically.
        </h4>

        <h5>
          Please feel free to{' '}
          <a href={SupportLinks.Contact('Optic App crash report')}>
            contact us about it.
          </a>
        </h5>

        <p>Meanwhile, you could try the following:</p>

        <ul>
          <li>
            Create a debug file and{' '}
            <a href={SupportLinks.Contact('Optic App crash report')}>
              {' '}
              email it to our team
            </a>{' '}
            or <a href={SupportLinks.GithubIssues}> open a GitHub issue</a>
            {': '}
            <ul>
              <li>Open Developer Tools</li>
              <li>
                Type <code>debugOptic()</code> in the console
              </li>
            </ul>
          </li>
          <li>
            <button onClick={onClickRefresh}>Refresh the page</button> in your
            browser.
          </li>
          <li>
            Try <a href="https://browsehappy.com/">a different browser</a>, if
            you can.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
