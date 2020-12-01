import React from 'react';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Container, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
import Paper from '@material-ui/core/Paper';
import StepperMain from './CustomStepper';
import { primary, SubtleBlueBackground } from '../../../theme';
import Page from '../../Page';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexGrow: 1,
  },
  paper: {
    overflow: 'hidden',
    height: '90vh',
  },
  left: {
    backgroundColor: primary,
    height: '100%',
    overflow: 'hidden',
    width: 260,
    display: 'flex',
    flexDirection: 'column',
  },
  right: {
    backgroundColor: '#FBF7F5',
    height: '100%',
    overflow: 'scroll',
    flex: 1,
    paddingLeft: 60,
    paddingRight: 60,
    paddingTop: 40,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
  },
  bottom: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'left',
  },
  pageBg: {
    backgroundImage: `url(${require('../../../assets/agsquare_dark_@2X.png')})`,
    backgroundSize: '100px 100px',
  },
}));

export function GuidedFlow({ objective, children, toc, currentStep }) {
  const classes = useStyles();
  return (
    <Page className={classes.pageBg}>
      <Container maxWidth="lg" style={{ paddingTop: '2.5%' }}>
        <Paper elevation={9} className={classes.paper}>
          <div className={classes.container}>
            <div className={classes.left}>
              <div className={classes.header}>
                <img
                  src={require('../../../assets/optic-white.svg')}
                  height={50}
                />
              </div>

              <StepperMain
                objective={objective}
                toc={toc}
                currentStep={currentStep}
              />

              <div style={{ flex: 1 }} />
              <div className={classes.bottom}>
                <Typography
                  variant="subtitle2"
                  style={{
                    color: SubtleBlueBackground,
                    marginLeft: 6,
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  Need Help?
                </Typography>
                <Button
                  size="small"
                  color="secondary"
                  onClick={() => window.Intercom('show')}
                  style={{
                    marginLeft: 2,
                    marginTop: 1,
                    color: SubtleBlueBackground,
                  }}
                  startIcon={<LiveHelpIcon color="white" />}
                >
                  Chat with a Maintainer
                </Button>
              </div>
            </div>
            <div className={classes.right}>{children}</div>
          </div>
        </Paper>
      </Container>
    </Page>
  );
}
