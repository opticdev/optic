import {Dialog} from '@material-ui/core';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import PropTypes from 'prop-types';

class ShapeSelectionDialog extends React.Component {
    render() {
        const {open, onClose, onShapeSelected} = this.props;
        return (
            <Dialog>
                <DialogTitle>Choose a Shape</DialogTitle>
                <DialogContent>
                    <DialogContentText>Once you choose a shape you can</DialogContentText>
                </DialogContent>
            </Dialog>
        );
    }
}

ShapeSelectionDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onShapeSelected: PropTypes.func.isRequired,
    onShapeClicked: PropTypes.func.isRequired
};

export default ShapeSelectionDialog;