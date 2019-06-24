import * as React from 'react';
import {Facade, Queries} from '../engine';
import {GenericContextFactory} from './GenericContextFactory.js';
import {withInitialRfcCommandsContext} from './InitialRfcCommandsContext.js';
import debounce from 'lodash.debounce';
import {withSnackbar} from 'notistack';
import {track} from '../Analytics';

const {
    Context: RfcContext,
    withContext: withRfcContext
} = GenericContextFactory(null);

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

    render() {
        const {queries, hasUnsavedChanges} = this.state;
        const {rfcId} = this.props;
        const apiName = queries.apiName();
        const contributions = queries.contributions()

        const {requests, pathComponents, responses, requestParameters} = queries.requestsState()
        const pathIdsByRequestId = queries.pathsWithRequests();
        const pathsById = pathComponents;
        const pathIdsWithRequests = new Set(Object.values(pathIdsByRequestId))

        const conceptsById = queries.concepts()
            .reduce((acc, item) => {
                acc[item.id] = item
                return acc
            }, {})


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
        }

        const value = {
            rfcId,
            queries,
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
