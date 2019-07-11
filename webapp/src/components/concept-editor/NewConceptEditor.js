import React from 'react';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext.js';
import {withRfcContext} from '../../contexts/RfcContext.js';
import {DataTypesHelper, ShapeCommands} from '../../engine';
import {routerUrls} from '../../routes.js';

class NewConceptEditor extends React.Component {
    state = {
        conceptName: ''
    }
    handleSubmit = () => {
        const {handleCommand, baseUrl, history, switchEditorMode} = this.props;
        const {conceptName} = this.state;
        const conceptId = DataTypesHelper.newConceptId();
        const conceptRootShapeId = DataTypesHelper.newId();
        switchEditorMode(EditorModes.DESIGN)
        handleCommand(ShapeCommands.DefineConcept(conceptName || 'Unnamed Concept', conceptRootShapeId, conceptId));
        history.push(routerUrls.conceptPage(baseUrl, conceptId));
    }
    handleNameChange = (e) => {
        const conceptName = e.target.value
        this.setState({
            conceptName
        })
    }

    render() {
        return (
            <div>
                <Dialog open={this.props.open} onClose={this.props.onClose} maxWidth="md" fullWidth>
                    <DialogTitle>Add a Concept</DialogTitle>
                    <DialogContent>
                        <DialogContentText>What is the Concept called?</DialogContentText>
                        <TextField autoFocus value={this.state.conceptName} onChange={this.handleNameChange}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.props.onClose}>Cancel</Button>
                        <Button onClick={this.handleSubmit} color="primary">Continue</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

NewConceptEditor.propTypes = {};

export default withStyles(() => ({}))(withEditorContext(withRfcContext(withRouter(NewConceptEditor))));