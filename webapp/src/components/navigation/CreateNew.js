import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Menu from '@material-ui/core/Menu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import Button from '@material-ui/core/Button';
import CodeIcon from '@material-ui/icons/Code';
import DescriptionIcon from '@material-ui/icons/Description';
import {withRouter} from 'react-router-dom';
import {withEditorContext} from '../../contexts/EditorContext';
import {PathContext} from '../../contexts/PathContext.js';
import {withFocusedRequestContext} from '../../contexts/FocusedRequestContext.js';
import {withRfcContext} from '../../contexts/RfcContext.js';
import {routerUrls} from '../../routes.js';
import {RequestUtilities} from '../../utilities/RequestUtilities.js';
import RequestContextMenu from '../context-menus/RequestContextMenu.js';
import NewRequestStepper from '../requests/NewRequestStepper.js';

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

class CreateNew extends React.Component {

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
        this.setState({isPathModalOpen: true});
    };

    closePathModal = () => {
        this.setState({isPathModalOpen: false});
    };

    renderRequestContextMenuItems() {
        const {focusedRequestId} = this.props;
        if (!focusedRequestId) {
            return null;
        }
        return (
            <RequestContextMenu requestId={focusedRequestId}/>
        );
    }

    addConcept = () => {
        const {history, baseUrl} = this.props;
        history.push(routerUrls.newConcept(baseUrl))
    }

    render() {
        const {classes, cachedQueryResults, render} = this.props;
        const {pathsById} = cachedQueryResults;

        return (
            <span>
				{(render) ? render({addRequest: this.openPathModal, addConcept: this.addConcept, classes}) : null}

                <Menu open={Boolean(this.state.anchorEl)} anchorEl={this.state.anchorEl} onClose={this.handleClose}>
					<div className={classes.wrapper}>
						<List dense subheader={<ListSubheader>API</ListSubheader>}>

							<ListItem>
								<Button
                                    color="primary" className={classes.button}
                                    onClick={this.openPathModal}>
									<CodeIcon className={classes.leftIcon}/>
									Request
								</Button>
							</ListItem>

							<ListItem>
								<Button
                                    color="primary" className={classes.button}
                                    onClick={this.addConcept}>
									<DescriptionIcon className={classes.leftIcon}/>
									Concept
								</Button>
							</ListItem>

						</List>

                        {this.renderRequestContextMenuItems()}
					</div>
				</Menu>

				<Dialog open={this.state.isPathModalOpen} onClose={this.closePathModal} maxWidth="md" fullWidth>
					<DialogTitle>Add Request(s)</DialogTitle>
					<DialogContent>
						<PathContext.Consumer>
							{(pathId) => {
                                const path = pathId === null ? '' : RequestUtilities.absolutePath(pathId, pathsById);

                                return (
                                    <NewRequestStepper onComplete={this.closePathModal} initialPathString={path}/>
                                );
                            }}
						</PathContext.Consumer>
					</DialogContent>
				</Dialog>
			</span>
        );
    }
}

export default withRouter(withFocusedRequestContext(withRfcContext(withEditorContext(withStyles(styles)(CreateNew)))));
