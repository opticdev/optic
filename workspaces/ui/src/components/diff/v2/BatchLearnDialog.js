import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import {Typography} from '@material-ui/core';
import {withEndpointsContext} from '../../../contexts/EndpointContext';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function _BatchLearnDialog(props) {
  const {isEmpty} = props.endpointDescriptor;

  const [open, setOpen] = React.useState(props.open || false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {props.button && props.button(handleClickOpen)}
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
      >
        <div style={{display: 'flex', flexDirection: 'row', padding: 12, alignItems: 'center'}}>
          <Avatar>
            <img src="/optic-logo.svg"/>
          </Avatar>
          <Typography component="div" variant="h6" style={{marginLeft: 12}}>{isEmpty ? 'New Endpoint Detected' : 'Approve Optic\'s Suggestions'}</Typography>
        </div>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {isEmpty ? 'Optic can document most of this endpoint automatically.' : 'Approve all the suggestions Optic has high confidence in.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Do it Manually
          </Button>
          <Button onClick={handleClose} color="secondary">
            {isEmpty ? 'Learn Endpoint' : 'Approve Suggestions'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


export default withEndpointsContext(_BatchLearnDialog)
