import React, { FC } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  return (
    <Dialog open={true} onClose={handleClose}>
      <DialogTitle>Confirm delete endpoint</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <div>
            Are you sure you want to delete endpoint the following endpoint?
            <EndpointName
              method={endpoint.method}
              fullPath={endpoint.fullPath}
            />
          </div>
          <div>This will do XYZ - TODO fill me in</div>
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
