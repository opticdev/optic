import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Commands, newRfcService} from './engine/index'
import niceTry from 'nice-try'
import Button from '@material-ui/core/Button';
import MasterView from './components/navigation/MasterView';
import CssBaseline from '@material-ui/core/CssBaseline';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import {appTheme} from './theme';

class App extends React.Component {

  render() {
    return (
        <React.Fragment>
          <CssBaseline/>
          <MuiThemeProvider theme={appTheme}>
            <MasterView />
          </MuiThemeProvider>
        </React.Fragment>
    );
  }
}

export default App;
