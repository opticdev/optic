import React, { useContext, useState } from 'react';
import Box from '@material-ui/core/Box';
import { Button, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import { makeStyles } from '@material-ui/core/styles';
import { StatMini } from './AskFinished';
import { LightBlueBackground } from '../../../theme';

export const FinalizeSummaryContext = React.createContext(null);

export function useFinalizeSummaryContext() {
  return useContext(FinalizeSummaryContext);
}

export function FinalizeSummaryContextStore(props) {
  const [summary, setSummary] = useState(null);

  const value = {
    setSummary: (newSummary) => {
      setSummary(newSummary);
    },
  };

  return (
    <FinalizeSummaryContext.Provider value={value}>
      <ResultsDialog
        open={Boolean(summary)}
        {...summary}
        dismiss={() => {
          setSummary(null);
        }}
      />
      {props.children}
    </FinalizeSummaryContext.Provider>
  );
}

function ResultsDialog(props) {
  const {
    oasStats,
    newEndpoints,
    newEndpointsKnownPaths,
    endpointsWithChanges,
  } = props;
  const classes = useStyles();
  if (!props.open) {
    return null;
  }

  const allNewEndpoints = newEndpoints + newEndpointsKnownPaths;

  return (
    <Dialog
      open={props.open}
      onClose={props.dismiss}
      keepMounted
      maxWidth="sm"
      BackdropProps={{
        classes: {
          root: classes.backDrop,
        },
      }}
      fullWidth
      style={{ padding: 0 }}
      TransitionComponent={Transition}
    >
      <div className={classes.commonStatus}>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          style={{
            backgroundColor: LightBlueBackground,
            padding: 12,
            border: `1px solid #e2e2e2`,
            width: '100%',
          }}
        >
          <Typography variant="h6" color="primary" style={{ fontWeight: 400 }}>
            Changes saved to specification
          </Typography>

          <Button onClick={props.dismiss} variant="contained" color="primary">
            Dismiss
          </Button>
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center">
          <div>
            <div style={{ padding: 20 }}>
              <Typography variant="subtitle1">
                {allNewEndpoints} new endpoint
                {allNewEndpoints !== 1 && 's'}, {endpointsWithChanges} updated
                endpoint
                {endpointsWithChanges !== 1 && 's'}
              </Typography>

              <Typography variant="h6" style={{ fontWeight: 100 }}>
                <StatMini number={oasStats.oasLineCount} label="line" /> of
                OpenAPI maintained by Optic
              </Typography>
            </div>
          </div>
        </Box>
      </div>
    </Dialog>
  );
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  backDrop: {
    backdropFilter: 'blur(2px)',
    backgroundColor: 'rgba(0,0,30,0.4)',
  },
  commonStatus: {
    width: '100%',
    minHeight: 80,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'column',
  },
}));
