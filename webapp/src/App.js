import React from 'react';
import './App.css';

import CssBaseline from '@material-ui/core/CssBaseline';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import {appTheme} from './theme';
import AppRoutes from './routes';
import {BrowserRouter, Route} from 'react-router-dom';

class App extends React.Component {

  render() {
    return (
        <React.Fragment>
          <CssBaseline/>
          <MuiThemeProvider theme={appTheme}>
              <BrowserRouter>
                  <>
                    <Route path="/" component={AppRoutes}/>
                  </>
              </BrowserRouter>
          </MuiThemeProvider>
        </React.Fragment>
    );
  }
}

export default App;
