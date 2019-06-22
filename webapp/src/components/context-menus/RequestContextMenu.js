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
import {DataTypesHelper, Primitives, RequestsCommands, RequestsHelper, ShapeCommands} from '../../engine';
import {RequestUtilities} from '../../utilities/RequestUtilities.js';

const styles = theme => ({
    button: {},
    leftIcon: {
        marginRight: theme.spacing.unit
    }
})

class RequestContextMenu extends React.Component {
    getCommandsToCreateString(rootId) {
        const conceptId = DataTypesHelper.newId()
        const defineInlineConcept = ShapeCommands.DefineInlineConcept(rootId, conceptId)
        const assignType = ShapeCommands.AssignType(rootId, Primitives.StringT(), conceptId)
        return {
            conceptId,
            commands: [defineInlineConcept, assignType]
        }
    }

    addBody = () => {
        const {handleCommands, requestId} = this.props;
        const newConceptId = DataTypesHelper.newId()
        const defineInlineConcept = ShapeCommands.DefineInlineConcept(requestId, newConceptId)
        const bodyDescriptor = RequestsCommands.ShapedBodyDescriptor('application/json', newConceptId, false)
        const setRequestBodyShape = RequestsCommands.SetRequestBodyShape(requestId, bodyDescriptor)

        handleCommands(defineInlineConcept, setRequestBodyShape)
    }

    addQueryParameter = () => {
        const {handleCommands, requestId} = this.props;
        const parameterId = RequestsHelper.newId()
        const {conceptId, commands} = this.getCommandsToCreateString(parameterId)
        const name = '???'
        const addQueryParameter = RequestsCommands.AddQueryParameter(parameterId, requestId, name)
        const parameterDescriptor = RequestsCommands.ShapedRequestParameterShapeDescriptor(conceptId, false)
        const setQueryParameterShape = RequestsCommands.SetQueryParameterShape(parameterId, parameterDescriptor)
        handleCommands(addQueryParameter, ...commands, setQueryParameterShape)
    }

    addHeaderParameter = () => {
        const {handleCommands, requestId} = this.props;
        const parameterId = RequestsHelper.newId()
        const {conceptId, commands} = this.getCommandsToCreateString(parameterId)
        const name = '???'
        const addHeaderParameter = RequestsCommands.AddHeaderParameter(parameterId, requestId, name)
        const parameterDescriptor = RequestsCommands.ShapedRequestParameterShapeDescriptor(conceptId, false)
        const setHeaderParameterShape = RequestsCommands.SetHeaderParameterShape(parameterId, parameterDescriptor)
        handleCommands(addHeaderParameter, ...commands, setHeaderParameterShape)
    }

    addResponse = () => {

        const {handleCommands, requestId} = this.props;
        const responseId = RequestsHelper.newId()
        const statusCode = 200
        const addResponse = RequestsCommands.AddResponse(responseId, requestId, statusCode)

        handleCommands(addResponse)
    }

    render() {
        const {classes, requestId, cachedQueryResults} = this.props;
        const {requests, pathsById} = cachedQueryResults;

        const request = requests[requestId]

        const canAddBody = RequestUtilities.canAddBody(request)

        const requestName = RequestUtilities.requestName(request, pathsById);

        return (
            <List dense subheader={<ListSubheader>{requestName}</ListSubheader>}>
                <ListItem>
                    <Button color="primary" className={classes.button} onClick={this.addQueryParameter}>
                        <SearchIcon className={classes.leftIcon}/>
                        Query Parameter
                    </Button>
                </ListItem>

                <ListItem>
                    <Button color="primary" className={classes.button} onClick={this.addHeaderParameter}>
                        <LabelIcon className={classes.leftIcon}/>
                        Header Parameter
                    </Button>
                </ListItem>

                <ListItem>
                    <Button color="primary" className={classes.button} disabled={!canAddBody} onClick={this.addBody}>
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

export default withRfcContext(withStyles(styles)(RequestContextMenu));