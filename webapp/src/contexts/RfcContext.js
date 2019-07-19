import * as React from 'react';
import {Facade, Queries, ShapesCommands} from '../engine';
import {GenericContextFactory} from './GenericContextFactory.js';
import {withInitialRfcCommandsContext} from './InitialRfcCommandsContext.js';
import debounce from 'lodash.debounce';
import {withSnackbar} from 'notistack';
import {track} from '../Analytics';

const {
    Context: RfcContext,
    withContext: withRfcContext
} = GenericContextFactory(null);

export const starterCommands = [
    ShapesCommands.AddShape('$Id', '$identifier', 'ID'),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInShape('$Id', ShapesCommands.ShapeProvider('$string'), '$identifierInner')),

    ShapesCommands.AddShape('$Account', '$object', 'Account'),
    ShapesCommands.AddShape('$AccountId', '$reference', 'Account ID'),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInShape('$AccountId', ShapesCommands.ShapeProvider('$Account'), '$referenceInner')),

    ShapesCommands.AddShape('$User', '$object', 'User'),
    ShapesCommands.AddShape('$UserId', '$reference', 'User ID'),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInShape('$UserId', ShapesCommands.ShapeProvider('$User'), '$referenceInner')),

    ShapesCommands.AddField('$Account.id', '$Account', 'id', ShapesCommands.FieldShapeFromShape('$Account.id', '$AccountId')),
    ShapesCommands.AddField('$Account.userIds', '$Account', 'userIds', ShapesCommands.FieldShapeFromShape('$Account.userIds', '$list')),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInField('$Account.userIds', ShapesCommands.ShapeProvider('$UserId'), '$listItem')),

    ShapesCommands.AddField('$User.id', '$User', 'id', ShapesCommands.FieldShapeFromShape('$User.id', '$string')),
    ShapesCommands.AddField('$User.name', '$User', 'name', ShapesCommands.FieldShapeFromShape('$User.name', '$string')),
    ShapesCommands.AddField('$User.accountId', '$User', 'accountId', ShapesCommands.FieldShapeFromShape('$User.accountId', '$AccountId')),

    ShapesCommands.AddShape('$PaginationWrapper', '$object', 'PaginationWrapper'),
    ShapesCommands.AddShapeParameter('$PaginationWrapper.T', '$PaginationWrapper', 'T'),
    ShapesCommands.AddField('$PaginationWrapper.offset', '$PaginationWrapper', 'offset', ShapesCommands.FieldShapeFromShape('$PaginationWrapper.offset', '$number')),
    ShapesCommands.AddField('$PaginationWrapper.items', '$PaginationWrapper', 'items', ShapesCommands.FieldShapeFromShape('$PaginationWrapper.items', '$list')),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInField('$PaginationWrapper.items', ShapesCommands.ParameterProvider('$PaginationWrapper.T'), '$listItem')),

    ShapesCommands.AddShape('$UserListResponse1', '$PaginationWrapper', 'User List Response 1'),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInShape('$UserListResponse1', ShapesCommands.ShapeProvider('$User'), '$PaginationWrapper.T')),

    ShapesCommands.AddShape('$UserListResponse2', '$PaginationWrapper', 'User List Response 2'),

    ShapesCommands.AddShape('$UserListResponse3', '$PaginationWrapper', 'User List Response 3'),
    ShapesCommands.AddShapeParameter('$UserListResponse3.X', '$UserListResponse3', 'X'),
    ShapesCommands.AddShapeParameter('$UserListResponse3.Y', '$UserListResponse3', 'Y'),
    ShapesCommands.SetParameterShape(ShapesCommands.ProviderInShape('$UserListResponse3', ShapesCommands.ParameterProvider('$UserListResponse3.X'), '$PaginationWrapper.T')),
    ShapesCommands.AddField('$UserListResponse3.item', '$UserListResponse3', 'item', ShapesCommands.FieldShapeFromParameter('$UserListResponse3.item', '$UserListResponse3.Y'))
]

class RfcStoreWithoutContext extends React.Component {


    constructor(props) {
        super(props);

        const eventStore = Facade.makeEventStore();
        const rfcService = Facade.fromJsonCommands(eventStore, this.props.initialCommandsString || '[]', this.props.rfcId)

        const queries = Queries(eventStore, rfcService, this.props.rfcId);

        if (this.props.initialEventsString) {
            eventStore.bulkAdd(this.props.rfcId, this.props.initialEventsString)
        }

        this.state = {
            eventStore,
            rfcService,
            queries,
            hasUnsavedChanges: false
        };
    }

    handleCommand = (command) => {
        // console.log({command})
        this.state.rfcService.handleCommands(this.props.rfcId, command);
        setTimeout(() => {
            this.forceUpdate();
            if (process.env.REACT_APP_CLI_MODE) {
                this.setState({hasUnsavedChanges: true})
                this.persistLocal()
            }
        }, 1)

        track('Command', {commandType: commandNameFor(command)})
    };

    handleCommands = (...commands) => {
        // console.log({commands})
        this.state.rfcService.handleCommands(this.props.rfcId, ...commands);
        setTimeout(() => {

            this.forceUpdate();
            if (process.env.REACT_APP_CLI_MODE) {
                this.setState({hasUnsavedChanges: true})
                this.persistLocal()
            }
        }, 1)

        commands.forEach(command => track('Command', {commandType: commandNameFor(command)}))
    };

    persistLocal = debounce(async () => {
        const eventString = this.serializeEvents()

        const response = await fetch('/save', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'text/html'
            },
            body: eventString
        });

        if (response.status === 200) {
            this.props.enqueueSnackbar('Saved', {'variant': 'success'})
            this.setState({hasUnsavedChanges: false})
        } else {
            this.props.enqueueSnackbar('Unable to save changes. Make sure the CLI is still running.', {'variant': 'error'})
        }

    }, 4000, {trailing: true})

    serializeEvents = () => {
        return this.state.eventStore.serializeEvents(this.props.rfcId);
    };

    componentDidMount() {

        starterCommands.forEach(command => console.log(command.toString()))
        this.handleCommands(...starterCommands)
    }

    render() {
        const {queries, hasUnsavedChanges} = this.state;
        const {rfcId} = this.props;
        const apiName = queries.apiName();
        const contributions = queries.contributions()

        const {requests, pathComponents, responses, requestParameters} = queries.requestsState()
        const pathIdsByRequestId = queries.pathsWithRequests();
        const pathsById = pathComponents;
        const pathIdsWithRequests = new Set(Object.values(pathIdsByRequestId))

        const conceptsById = queries.namedShapes()
        const shapesState = queries.shapesState()


        const requestIdsByPathId = Object
            .entries(pathIdsByRequestId)
            .reduce((acc, entry) => {
                const [requestId, pathId] = entry;
                const value = acc[pathId] || []
                value.push(requestId)
                acc[pathId] = value;
                return acc
            }, {})


        const cachedQueryResults = {
            contributions,
            requests,
            requestParameters,
            responses,
            conceptsById,
            pathIdsByRequestId,
            requestIdsByPathId,
            pathsById,
            pathIdsWithRequests,
            shapesState
        }

        const value = {
            rfcId,
            queries: {
                ...queries,
                shapeById: (...args) => {
                    console.count('shapeById')
                    console.count(`shapeById(${[...args]})`)
                    return queries.shapeById(...args)
                }
            },
            cachedQueryResults,
            apiName,
            handleCommand: this.handleCommand,
            handleCommands: this.handleCommands,
            serializeEvents: this.serializeEvents,
            hasUnsavedChanges
        };

        return (
            <RfcContext.Provider value={value}>
                {this.props.children}
            </RfcContext.Provider>
        );
    }
}

const RfcStore = withSnackbar(withInitialRfcCommandsContext(RfcStoreWithoutContext));

export {
    RfcStore,
    RfcContext,
    withRfcContext
};


function commandNameFor(command) {
    const name = command.$classData.name
    const split = name.split('$')
    return split[1]
}
