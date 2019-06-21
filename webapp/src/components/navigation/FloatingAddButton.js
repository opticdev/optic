import Dialog from '@material-ui/core/Dialog';
import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Menu from '@material-ui/core/Menu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import Button from '@material-ui/core/Button';
import CodeIcon from '@material-ui/icons/Code';
import DescriptionIcon from '@material-ui/icons/Description';
import Zoom from '@material-ui/core/Zoom';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';
import {withFocusedRequestContext} from '../../contexts/FocusedRequestContext.js';
import RequestContextMenu from '../context-menus/RequestContextMenu.js';
import PathEditor from '../path-editor/PathEditor.js';

const styles = theme => ({
    fab: {
        position: 'fixed',
        bottom: 50,
        right: 50
    },
    wrapper: {
        display: 'flex',
        flexDirection: 'row'
    },
    button: {},
    leftIcon: {
        marginRight: theme.spacing.unit,
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
    iconSmall: {
        fontSize: 20,
    },
});

class FloatingAddButton extends React.Component {

    state = {
        anchorEl: false,
        isPathModalOpen: false,
    };

    handleOpen = (event) => {
        this.setState({anchorEl: event.target});
    };

    handleClose = (event) => {
        this.setState({anchorEl: false});
    };

    openPathModal = () => {
        this.setState({isPathModalOpen: true})
    }

    closePathModal = () => {
        this.setState({isPathModalOpen: false})
    }

    renderRequestContextMenuItems() {
        const {focusedRequestId} = this.props;
        if (!focusedRequestId) {
            return null
        }
        return (
            <RequestContextMenu requestId={focusedRequestId}/>
        )
    }

    render() {
        const {classes, mode} = this.props;
        return (
            <div>
                <Zoom in={mode === EditorModes.DESIGN}>
                    <Fab className={classes.fab} color="secondary" onClick={this.handleOpen}>
                        <AddIcon/>
                    </Fab>
                </Zoom>

                <Menu open={Boolean(this.state.anchorEl)} anchorEl={this.state.anchorEl} onClose={this.handleClose}>
                    <div className={classes.wrapper}>
                        <List dense subheader={<ListSubheader>API</ListSubheader>}>

                            <ListItem>
                                <Button color="primary" className={classes.button}
                                        onClick={this.openPathModal}>
                                    <CodeIcon className={classes.leftIcon}/>
                                    Request
                                </Button>
                            </ListItem>

                            <ListItem>
                                <Button color="primary" className={classes.button}>
                                    <DescriptionIcon className={classes.leftIcon}/>
                                    Concept
                                </Button>
                            </ListItem>

                        </List>

                        {this.renderRequestContextMenuItems()}
                    </div>
                </Menu>
                {/*</Zoom>*/}

                <Dialog open={this.state.isPathModalOpen} onClose={this.closePathModal} maxWidth="md" fullWidth>
                    <div style={{padding: 10}}>
                        <PathEditor onSubmit={this.closePathModal}/>
                    </div>
                </Dialog>
            </div>
        );
    }
}

export default withFocusedRequestContext(withEditorContext(withStyles(styles)(FloatingAddButton)));
