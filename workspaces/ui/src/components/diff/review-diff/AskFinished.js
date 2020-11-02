import React, { useMemo } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { useBaseUrl } from '../../../contexts/BaseUrlContext';
import { useHistory } from 'react-router-dom';
import { useDiffSession } from './ReviewDiffSession';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { TextFields } from '@material-ui/icons';
import TextField from '@material-ui/core/TextField';
import {
  LightBlueBackground,
  OpticBlueReadable,
  SubtleBlueBackground,
} from '../../../theme';
import Card from '@material-ui/core/Card';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function AskFinished(props) {
  const { askFinish, setAskFinish } = props;
  const history = useHistory();
  const { baseDiffReviewPath, queries } = useDiffSession();
  const classes = useStyles();

  const changes = useMemo(() => {
    if (askFinish) {
      return queries.endpointsWithSuggestions();
    } else {
      return [];
    }
  }, [askFinish]);

  const handleClose = () => {
    setAskFinish(false);
  };

  const handleFinalize = () => {
    setAskFinish(false);
    // history.push(baseDiffReviewPath + '/finalize');
  };

  return (
    <Dialog
      open={askFinish}
      onClose={handleClose}
      TransitionComponent={Transition}
      keepMounted
      maxWidth="sm"
      fullWidth
      style={{ padding: 0 }}
    >
      <div className={classes.root}>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          style={{
            backgroundColor: LightBlueBackground,
            padding: 12,
            border: `1px solid #e2e2e2`,
            width: '100%',
          }}
        >
          <PulsingOpticHuge />
          <Typography variant="h6">Finalize Changes</Typography>
        </Box>

        <Box style={{ padding: 12, width: '100%' }}>
          <TextField multiline fullWidth label="Describe your changes..." />

          <div style={{ marginTop: 20 }}>
            this will be the list of changes...
          </div>
        </Box>
      </div>
    </Dialog>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const PulsingOpticHuge = () => (
  <div className={'blobMedium'} style={{ marginRight: 9 }}>
    <img src="/optic-logo.svg" width={50} height={50} />
  </div>
);
