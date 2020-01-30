import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import './App.css';
import ImportantDevicesIcon from '@material-ui/icons/ImportantDevices'
import { Hidden } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import { appTheme } from './theme';
import AppRoutes from './routes';
import { BrowserRouter, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@material-ui/core/styles'

class App extends React.Component {

  render() {
    return (
      <React.Fragment>
          <CssBaseline />
          <ThemeProvider theme={appTheme}>
            <Hidden smUp>
              <Dialog open fullScreen>
                <DialogTitle>Mobile Coming Soon!</DialogTitle>
                <DialogContent>
                  <div style={{ textAlign: 'center', padding: '1em' }}><ImportantDevicesIcon style={{ width: '4em', height: '4em' }} /></div>
                  <DialogContentText>
                    <Typography>We're still working on making our mobile experience great.</Typography>
                    <br />
                    <Typography>Please visit <a href="https://design.useoptic.com">design.useoptic.com</a> on a device with a larger screen.</Typography>
                  </DialogContentText>
                </DialogContent>
              </Dialog>
            </Hidden>
            <SnackbarProvider maxSnack={1}>
              <BrowserRouter>
                <>
                  <Route path="/" component={AppRoutes} />
                </>
              </BrowserRouter>
            </SnackbarProvider>
          </ThemeProvider>
      </React.Fragment>
    );
  }
}

export default App;
