import React from 'react';
import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import { appTheme } from './theme';
import { BrowserRouter, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@material-ui/core/styles';
import TopLevelRoutes from './entrypoints';
import { touchAnalytics } from './Analytics';

class App extends React.Component {

  componentDidMount() {
    touchAnalytics();
  }

  render() {
    return (
      <React.Fragment>
        <CssBaseline/>
        <ThemeProvider theme={appTheme}>
          <SnackbarProvider maxSnack={1}>
            <BrowserRouter>
              <>
                <Route path="/" component={TopLevelRoutes}/>
              </>
            </BrowserRouter>
          </SnackbarProvider>
        </ThemeProvider>
      </React.Fragment>
    );
  }
}

export default App;
