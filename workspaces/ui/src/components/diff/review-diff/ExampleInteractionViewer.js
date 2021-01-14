import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { JsonHelper } from '@useoptic/domain';
import { getReasonPhrase } from 'http-status-codes';
import InteractionBodyViewerAllJS from './shape-viewers/InteractionBodyViewerAllJS';
import Grid from '@material-ui/core/Grid';
import { OpticBlue } from '../../../theme';
import { PathAndMethodLarge } from './PathAndMethod';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function ExampleInteractionViewer(props) {
  const {
    expandExample,
    interaction,
    setExpandExample,
    location,
    diffBodyViewer,
  } = props;
  const classes = useStyles();
  const { method, path } = interaction.request;
  const { statusCode } = interaction.response;

  const requestBody = JsonHelper.fromInteractionBodyToJs(
    interaction.request.body
  );
  const responseBody = JsonHelper.fromInteractionBodyToJs(
    interaction.response.body
  );

  if (!expandExample) {
    return null;
  }

  return (
    <Dialog
      TransitionComponent={Transition}
      fullWidth={true}
      maxWidth={'md'}
      open={expandExample}
      BackdropProps={{
        classes: {
          root: classes.backDrop,
        },
      }}
      onClose={() => setExpandExample(false)}
    >
      <div className={classes.inner}>
        <div style={{ padding: 10 }}>
          <PathAndMethodLarge path={path} method={method} />
        </div>
        {requestBody.asJson && (
          <div className={classes.region} style={{ marginBottom: 22 }}>
            <div className={classes.header}>
              <Typography variant="caption" className={classes.headerText}>
                Request
              </Typography>
              <div style={{ flex: 1 }} />
              <Typography variant="caption" className={classes.headerText}>
                {interaction.request.body.contentType}
              </Typography>
            </div>
            {location.inRequest ? (
              diffBodyViewer
            ) : (
              <InteractionBodyViewerAllJS body={requestBody} jsonTrails={[]} />
            )}
          </div>
        )}

        {responseBody.asJson && (
          <div className={classes.region}>
            <div className={classes.header}>
              <Typography variant="caption" className={classes.headerText}>
                Response {statusCode} - {getReasonPhrase(statusCode)}
              </Typography>
              <div style={{ flex: 1 }} />
              <Typography variant="caption" className={classes.headerText}>
                {interaction.response.body.contentType}
              </Typography>
            </div>
            {location.inResponse ? (
              diffBodyViewer
            ) : (
              <InteractionBodyViewerAllJS body={responseBody} jsonTrails={[]} />
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}

const useStyles = makeStyles((theme) => ({
  inner: {
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
  },
  backDrop: {
    backdropFilter: 'blur(2px)',
    backgroundColor: 'rgba(0,0,30,0.4)',
  },
  header: {
    backgroundColor: OpticBlue,
    padding: 4,
    display: 'flex',
    position: 'sticky',
    top: 0,
    zIndex: 900,
  },
  headerText: {
    color: 'rgb(134, 141, 164)',
    fontFamily: 'Inter',
    fontWeight: 600,
    fontSize: 12,
    marginLeft: 10,
  },
}));
