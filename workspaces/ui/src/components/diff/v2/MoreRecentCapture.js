import React, {useContext} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import {AllCapturesContext} from './CaptureManagerPage';
import {useParams} from 'react-router-dom';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function MoreRecentCapture(props) {
  const {captures, dismissed, dismissCapture, switchToCapture} = useContext(AllCapturesContext);
  const {captureId} = useParams();
  const latestCaptureId = captures.length > 0 ? captures[0].captureId : null;
  const hidden = latestCaptureId === null || (captureId === latestCaptureId) || dismissed.includes(latestCaptureId);

  function handleReview() {
    switchToCapture(latestCaptureId);
  }

  function handleDismiss() {
    dismissCapture(latestCaptureId);
  }

  return (
    <Dialog
      open={!hidden}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleDismiss}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle id="alert-dialog-slide-title">New Capture</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Optic has observed a newer Capture than the one you are currently working on.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDismiss} color="primary">
          Dismiss
        </Button>
        <Button onClick={handleReview} color="primary">
          Review
        </Button>
      </DialogActions>
    </Dialog>
  );
}
