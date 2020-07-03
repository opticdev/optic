import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { useCaptureContext } from '../../../contexts/CaptureContext';
import { DocDarkGrey } from '../../docs/DocConstants';

export function DiffStats(props) {
  const { showSkipped } = props;
  const classes = useStyles();

  const { processed, skipped, completed } = useCaptureContext();

  return (
    <div className={classes.statsSection}>
      <div style={{ marginTop: 7 }}>
        {completed ? (
          <CircularProgress
            size={12}
            variant="determinate"
            style={{ opacity: 0.3 }}
            value={100}
          />
        ) : (
          <CircularProgress size={12} variant="indeterminate" />
        )}
      </div>
      <Typography
        component="div"
        variant="overline"
        style={{ fontSize: 12 }}
        className={classes.progressStats}
      >
        {processed} processed {showSkipped && ` | ${skipped} skipped`}
      </Typography>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  progressStats: {
    paddingLeft: theme.spacing(1),
    color: DocDarkGrey,
    flex: 1,
  },
  statsSection: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: theme.spacing(2),
  },
}));
