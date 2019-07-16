import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import {Button} from '@material-ui/core';
import {SchemaEditorContext} from '../../../contexts/SchemaEditorContext';
import SchemaEditor from '../SchemaEditor';
import {ShapesCommands, ShapesHelper} from '../../../engine'
import {withRfcContext} from '../../../contexts/RfcContext';
import {EditorModes} from '../../../contexts/EditorContext';
import sortBy from 'lodash.sortby'

const styles = theme => ({
    root: {
        padding: 11,
        overflow: 'hidden',
        height: '100%'
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        height: 600
    },
    left: {
        width: 200,
        paddingLeft: 10,
        overflow: 'scroll',
        borderRight: '1px solid #e2e2e2'
    },
    right: {
        flex: 1,
        paddingLeft: 30,
        paddingRight: 30,
        overflow: 'scroll'
    },
    title: {
        ...theme.typography.h5,
        padding: 22,
        display: 'flex',
        flexDirection: 'row'
    },
    option: {
        paddingLeft: 12,
        height: '37px !important'
    }

});

class TypeRefModal extends React.Component {

    initialState = () => {
        return {
            selected: null
        }
    }

    state = this.initialState()


    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.targetId !== this.props.targetId) {
            this.setState(this.initialState())
        }
    }

    select = (id) => () => {
        this.setState({selected: id})
    }

    render() {
        const {classes, targetId, queries} = this.props

        return (
            <SchemaEditorContext.Consumer>
                {({allowedReferences, conceptId, operations}) => {

                    const selected = allowedReferences.find(i => i.id === this.state.selected)
                    const sortedAllowedReferences = sortBy(allowedReferences, 'name')
                    return (
                        <Dialog
                            open={Boolean(targetId)} maxWidth="lg" fullWidth={true}
                            onClose={operations.hideRefModal}
                        >
                            <div className={classes.title}>
                                <div style={{flex: 1}}>Choose Concept</div>
                                <div style={{textAlign: 'right', display: (selected) ? 'inherit' : 'none'}}>
                                    <Button
                                        disabled={!selected}
                                        color="secondary"
                                        style={{textTransform: 'none'}}
                                        onClick={() => {
                                            operations.runCommand(ShapesCommands.AssignType(targetId, ShapesHelper.refTo(selected.id), conceptId))
                                            operations.hideRefModal()
                                        }}
                                    >Set Type to {selected ? selected.name : ''}</Button>
                                </div>
                            </div>
                            <div className={classes.container}>
                                <div className={classes.left}>
                                    <List dense={true}>
                                        {sortedAllowedReferences.map(ref => {
                                            return (
                                                <ListItem
                                                    button
                                                    dense={true}
                                                    key={ref.id}
                                                    className={classes.option}
                                                    selected={ref.id === this.state.selected}
                                                    onClick={this.select(ref.id)}>
                                                    <ListItemText
                                                        primary={ref.name}
                                                        primaryTypographyProps={{style: {fontWeight: 200}}}/>
                                                </ListItem>
                                            )
                                        })}
                                    </List>
                                </div>
                                <div className={classes.right}>
                                    {this.state.selected ? (() => {
                                        const conceptId = this.state.selected
                                        const {allowedReferences, concept} = queries.conceptById(conceptId);
                                        return (
                                            <SchemaEditor
                                                conceptId={conceptId}
                                                currentShape={concept}
                                                allowedReferences={allowedReferences}
                                                mode={EditorModes.DOCUMENTATION}
                                            />
                                        )
                                    })() : null}
                                </div>
                            </div>
                        </Dialog>
                    )
                }}
            </SchemaEditorContext.Consumer>
        )
    }
}

export default withRfcContext(withStyles(styles)(TypeRefModal))
