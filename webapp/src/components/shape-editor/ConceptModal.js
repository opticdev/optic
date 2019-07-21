import {Dialog} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import {EditorModes, EditorStore, withEditorContext} from '../../contexts/EditorContext.js';
import {ShapeEditorStore, withShapeEditorContext} from '../../contexts/ShapeEditorContext.js';
import {ShapesCommands} from '../../engine';
import {updateContribution} from '../../engine/routines.js';
import ContributionTextField from '../contributions/ContributionTextField.js';
import ShapeViewer from './ShapeViewer.js';


class ConceptModalBase extends React.Component {

    render() {
        const {selectedItem, onSelect, setSelectedItem} = this.props;
        const {baseUrl, choices} = this.props
        const {cachedQueryResults, queries, handleCommand} = this.props

        const {shapesState, contributions} = cachedQueryResults
        const selectedShape = selectedItem && shapesState.shapes[selectedItem.id] ? queries.shapeById(selectedItem.id) : null
        const choiceComponents = choices
            .map(choice => {
                return (
                    <ListItem
                        key={choice.id}
                        button
                        selected={selectedItem && (choice.id === selectedItem.id)}
                        onClick={() => setSelectedItem(choice)}
                    >
                        <ListItemText>{choice.displayName}</ListItemText>
                    </ListItem>
                )
            })
        let content = <Typography>Pick a shape!</Typography>

        if (selectedShape) {
            const mode = EditorModes.DOCUMENTATION
            const {shapeId} = selectedShape;
            content = (
                <React.Fragment>
                    <EditorStore baseUrl={baseUrl} e>
                        <ShapeEditorStore readOnly onShapeSelected={(shapeId) => {

                            const choice = choices.find(x => x.id === shapeId)
                            if (choice) {
                                setSelectedItem(choice)
                            } else {
                                debugger
                            }
                        }}>
                            <ContributionTextField
                                key={`${shapeId}-name`}
                                value={selectedShape.name}
                                variant={'heading'}
                                placeholder={'Concept Name'}
                                mode={mode}
                                onBlur={(value) => {
                                    const command = ShapesCommands.RenameShape(shapeId, value)
                                    handleCommand(command)
                                }}
                            />

                            <ContributionTextField
                                key={`${shapeId}-description`}
                                value={contributions.getOrUndefined(shapeId, 'description')}
                                variant={'multi'}
                                placeholder={'Description'}
                                mode={mode}
                                onBlur={(value) => {
                                    handleCommand(updateContribution(shapeId, 'description', value));
                                }}
                            />
                            <ShapeViewer shape={selectedShape}/>
                        </ShapeEditorStore>
                    </EditorStore>
                </React.Fragment>
            )
        }
        return (
            <Dialog
                open={this.props.open}
                disablePortal={false}
                onClose={this.props.onClose}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Choose a Shape</DialogTitle>
                <DialogContent>
                    <Grid container>
                        <Grid item xs={3} style={{
                            maxHeight: '70vh',
                            overflow: 'auto',
                            paddingRight: '1em',
                            borderRight: '1px solid darkgrey'
                        }}>
                            <List>
                                {choiceComponents}
                            </List>
                        </Grid>
                        <Grid item xs={9}>
                            <div style={{padding: '1em'}}>
                                {content}
                            </div>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.onClose}>Cancel</Button>
                    <Button disabled={!selectedItem} onClick={() => {
                        onSelect(selectedItem)
                        this.props.onClose()
                    }}>Select</Button>
                </DialogActions>
            </Dialog>
        )
    }
}

const ConceptModal = withShapeEditorContext(withEditorContext(ConceptModalBase))
export default ConceptModal