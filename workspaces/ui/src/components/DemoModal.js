import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { track } from './../Analytics';
import demoGraphic from '../assets/demoGraphic.svg'

export const DemoModal = (props) => {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  console.log('wowza!')
  return (
    <div>
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="md"
          aria-labelledby="form-dialog-title"
        >
          <form>
            <DialogTitle style={{ textAlign: 'center' }}>Ready to integrate Optic with your API?</DialogTitle>
            <DialogContent style={{ marginTop: -20 , textAlign: 'center'}}>
              <DialogContentText style={{ marginTop: 12 }}>
              Keep exploring the Optic demo, or start integrating Optic into your own projects
              </DialogContentText>
              <img src={demoGraphic} />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Show me more</Button>
              <Button
                autoFocus={false}
                type="submit"
                onClick={() => {window.open("https://auth.useoptic.com/login")}}
                color="secondary"
                endIcon={<NavigateNextIcon />}
              >
                Lets Go
              </Button>
            </DialogActions>
          </form>
        </Dialog>
    </div>
  )
};