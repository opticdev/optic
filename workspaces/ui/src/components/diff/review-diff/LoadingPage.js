import React, { useEffect, useMemo, useState } from 'react';
import Page from '../../Page';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import {
  CircularDiffLoaderProgress,
  CircularDiffProgress,
} from '../../../storybook/stories/diff-page/CircularDiffProgress';
import { Typography } from '@material-ui/core';
import { useCaptureContext } from '../../../contexts/CaptureContext';
import { useServices } from '../../../contexts/SpecServiceContext';
export function LoadingReviewPage() {
  const classes = useStyles();

  const { specService } = useServices();

  const { completed, skipped, processed, captureId } = useCaptureContext();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    specService.getCaptureStatus(captureId).then((i) => setStatus(i));
  }, [captureId]);

  const cursor = parseInt(processed) + parseInt(skipped);

  const total = status && status.interactionsCount;

  console.log({ completed, skipped, processed, status });

  return (
    <Page>
      <Page.Navbar mini={true} />
      <Page.Body
        padded={false}
        style={{
          flexDirection: 'row',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={1} className={classes.loading}>
          <CircularDiffLoaderProgress
            startBlue
            handled={cursor}
            total={total}
            symbol=""
          />
          <div className={classes.rightRegion}>
            <Typography variant="h6" style={{ fontWeight: 200 }}>
              Running Diff...
            </Typography>
            <Typography variant="caption" style={{ fontWeight: 200 }}>
              Rust Diff Engine v8.15.32
            </Typography>
            <Typography variant="caption" style={{ fontWeight: 200 }}>
              Rust Diff Engine v8.15.32
            </Typography>
          </div>
        </Paper>
      </Page.Body>
    </Page>
  );
}

const useStyles = makeStyles((theme) => ({
  loading: {
    padding: 12,
    display: 'flex',
    flexDirection: 'row',
    // border: '1px solid #e2e2e2',
  },
  rightRegion: {
    paddingLeft: 12,
    marginLeft: 12,
    borderLeft: '1px solid #e2e2e2',
  },
}));
