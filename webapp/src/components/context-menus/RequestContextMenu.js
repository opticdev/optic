import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles.js';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import SearchIcon from '@material-ui/icons/Search';
import LabelIcon from '@material-ui/icons/Label';
import MessageIcon from '@material-ui/icons/Message';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswerOutlined';
import {withRfcContext} from '../../contexts/RfcContext.js';
import {RequestsCommands, RequestsHelper} from '../../engine';
import {RequestUtilities} from '../../utilities/RequestUtilities.js';
import {RequestsCommandHelper} from '../requests/RequestsCommandHelper.js';

const styles = theme => ({
    button: {},
    leftIcon: {
        marginRight: theme.spacing.unit
    }
})

class RequestContextMenu extends React.Component {

    addResponse = () => {

        const {handleCommands, requestId} = this.props;
        const responseId = RequestsHelper.newResponseId()
        const statusCode = 200
        const addResponse = RequestsCommands.AddResponse(responseId, requestId, statusCode)

        handleCommands(addResponse)
    }

    render() {
        const {classes, requestId, handleCommands, cachedQueryResults} = this.props;
        const {requests, pathsById} = cachedQueryResults;

        const request = requests[requestId]

        const requestsCommandHelper = new RequestsCommandHelper(handleCommands, requestId)

        const canAddBody = RequestUtilities.canAddBody(request)

        const requestName = RequestUtilities.requestName(request, pathsById);

        return (
            <List dense subheader={<ListSubheader>{requestName}</ListSubheader>}>
                <ListItem>
                    <Button color="primary" className={classes.button} onClick={requestsCommandHelper.addQueryParameter}>
                        <SearchIcon className={classes.leftIcon}/>
                        Query Parameter
                    </Button>
                </ListItem>

                <ListItem>
                    <Button color="primary" className={classes.button} onClick={requestsCommandHelper.addHeaderParameter}>
                        <LabelIcon className={classes.leftIcon}/>
                        Header Parameter
                    </Button>
                </ListItem>

                <ListItem>
                    <Button color="primary" className={classes.button} disabled={!canAddBody} onClick={requestsCommandHelper.addBody}>
                        <MessageIcon className={classes.leftIcon}/>
                        Request Body
                    </Button>
                </ListItem>

                <ListItem>
                    <Button color="primary" className={classes.button} onClick={this.addResponse}>
                        <QuestionAnswerIcon className={classes.leftIcon}/>
                        Response
                    </Button>
                </ListItem>

            </List>
        );
    }
}

RequestContextMenu.propTypes = {
    requestId: PropTypes.string.isRequired
};

export default withRfcContext(withRfcContext(withStyles(styles)(RequestContextMenu)));
