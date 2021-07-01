import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { appTheme } from './styles';
import { BrowserRouter, Route } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import * as SupportLinks from './constants/SupportLinks';

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

function AppError() {
  return (
    <div style={{ padding: '12px 24px' }}>
      <div>
        <h1>There was a problem in displaying the Optic app.</h1>

        <h4>
          Something that we didn't anticipate happened, and we can't recover
          from it automatically.
        </h4>

        <div>
          You can help us debug this error:
          <ul>
            <li>
              {/* eslint-disable-next-line */}
              <a href="#" onClick={window.debugOptic}>
                Click here
              </a>{' '}
              to generate a debug file
            </li>
            <li>
              Send the debug file to{' '}
              <a href={SupportLinks.Contact('Optic App crash report')}>
                our team
              </a>
            </li>
          </ul>
          <p>
            This debug file includes information about your specification,
            current UI state and captured traffic Optic has seen.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
