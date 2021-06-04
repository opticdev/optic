import React, { FC } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
} from '@material-ui/core';

import { EndpointName } from '<src>/components';
import { IEndpoint } from '<src>/types';

type DeleteEndpointConfirmationModalProps = {
  endpoint: IEndpoint;
  handleClose: () => void;
  handleConfirm: () => void;
};

export const DeleteEndpointConfirmationModal: FC<DeleteEndpointConfirmationModalProps> = ({
  endpoint,
  handleClose,
  handleConfirm,
}) => {
  const classes = useStyles();
  return (
    <Dialog open={true} onClose={handleClose}>
      <DialogTitle>Confirm delete endpoint</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <div className={classes.confirmationTextContainer}>
            Are you sure you want to delete endpoint the following endpoint?
            <EndpointName
              method={endpoint.method}
              fullPath={endpoint.fullPath}
            />
          </div>
          <div className={classes.confirmationTextContainer}>
            This will permanently delete this endpoint. You will lose all
            contributions associated with this endpoint and will no longer see
            this endpoint in your documentation page.
          </div>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="default">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="secondary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles((theme) => ({
  confirmationTextContainer: {
    padding: '8px 0',
  },
}));
