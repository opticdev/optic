import React, { useCallback, useEffect } from 'react';
import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import { appTheme } from './theme';
import { BrowserRouter, Route, useLocation } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@material-ui/core/styles';
import TopLevelRoutes from './entrypoints';
import { touchAnalytics, track } from './Analytics';
import * as SupportLinks from './components/support/Links';

class App extends React.Component {
  state = { hasError: false };

  render() {
    const { hasError } = this.state;

    if (hasError) return <AppError />;

    return (
      <React.Fragment>
        <CssBaseline />
        <ThemeProvider theme={appTheme}>
          <SnackbarProvider maxSnack={1}>
            <BrowserRouter>
              <ScrollToTop/>
              <>
                <Route path="/" component={TopLevelRoutes} />
              </>
            </BrowserRouter>
          </SnackbarProvider>
        </ThemeProvider>
      </React.Fragment>
    );
  }
  // Life cycle methods
  // ------------------
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidMount() {
    touchAnalytics();
  }
}

function AppError() {
  const onClickRefresh = useCallback((e) => {
    e.preventDefault();
    window && window.location && window.location.reload(true);
  });

  useEffect(() => {
    track('In-App-Error');
  });

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
            <a href="#" onClick={onClickRefresh}>
              Refresh the page
            </a>{' '}
            in your browser.
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

// used to make sure we don't preserve scroll between pages

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default App;
