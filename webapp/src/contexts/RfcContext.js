import * as React from 'react';
import { commandsToJson, Facade, Queries } from '../engine';
import { GenericContextFactory } from './GenericContextFactory.js';
import { withInitialRfcCommandsContext } from './InitialRfcCommandsContext.js';
import debounce from 'lodash.debounce';
import { withSnackbar } from 'notistack';
import { track } from '../Analytics';

const {
    Context: RfcContext,
    withContext: withRfcContext
} = GenericContextFactory(null);

global.commands = []
global.getCommandsAsJson = function () {
    return commandsToJson(global.commands)
}
export function stuffFromQueries(queries) {
    const apiName = queries.apiName();
    const contributions = queries.contributions()

    const { requests, pathComponents, responses, requestParameters } = queries.requestsState()
    const pathIdsByRequestId = queries.pathsWithRequests();
    const pathsById = pathComponents;
    // const absolutePaths = Object.keys(pathsById).map(pathId => ({ [pathId]: queries.absolutePath(pathId) })).reduce((acc, value) => Object.assign(acc, value), {})
    // console.log({ absolutePaths })
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
        apiName,
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
    return cachedQueryResults
}
class RfcStoreWithoutContext extends React.Component {

    constructor(props) {
        super(props);

        this.handleCommands = this.handleCommands.bind(this)
        const { initialCommandsString, initialEventsString, rfcId } = this.props;
        const eventStore = Facade.makeEventStore();

        if (initialEventsString) {
            // console.log({ bulkAdd: initialEventsString })
            eventStore.bulkAdd(rfcId, initialEventsString)
        }
        const rfcService = (function () {
            try {
                return Facade.fromJsonCommands(eventStore, initialCommandsString || '[]', rfcId)
            } catch (e) {
                //@GOTCHA: eventStore is being mutated in the try{} so any commands that have succeeded will be part of eventStore here.
                console.error(e);
                debugger;
                return Facade.fromJsonCommands(eventStore, '[]', rfcId)
            }
        })()
        const queries = Queries(eventStore, rfcService, rfcId);

        this.state = {
            eventStore,
            rfcService,
            queries,
            hasUnsavedChanges: false
        };
    }

    handleCommand = (command) => {
        this.handleCommands(command)
    };

    handleChange = debounce(() => {
        this.forceUpdate()
    }, 10, { leading: true })

    handleCommands(...commands) {
        try {
            //debugger
            this.state.rfcService.handleCommands(this.props.rfcId, ...commands);
            global.commands.push(...commands)
            this.handleChange()
        } catch (e) {
            debugger
            console.error(e)
            console.log(...commands)
            console.log(commandsToJson(commands))
        }

        //commands.forEach(command => track('Command', { commandType: commandNameFor(command) }))
    }

    render() {
        const { queries, eventStore, hasUnsavedChanges, rfcService } = this.state;
        const { rfcId } = this.props;
        const cachedQueryResults = stuffFromQueries(queries)
        const value = {
            rfcId,
            rfcService,
            eventStore,
            queries,
            cachedQueryResults,
            handleCommand: this.handleCommand,
            handleCommands: this.handleCommands,
            hasUnsavedChanges
        };

        return (
            <RfcContext.Provider value={value}>
                {this.props.children}
            </RfcContext.Provider>
        );
    }
}

const RfcStore = withInitialRfcCommandsContext(RfcStoreWithoutContext);


class LocalRfcStoreWithoutContext extends RfcStoreWithoutContext {

    handleCommands = (...commands) => {
            super.handleCommands(...commands)
            this.setState({ hasUnsavedChanges: true })
            this.persistEvents()
        }

    persistEvents = debounce(async () => {
        const response = await saveEvents(this.state.eventStore, this.props.rfcId)

        if (response.ok) {
            // this.props.enqueueSnackbar('Saved', { 'variant': 'success' })
            this.setState({ hasUnsavedChanges: false })
        } else {
            this.props.enqueueSnackbar('Unable to save changes. Make sure the CLI is still running.', { 'variant': 'error' })
        }

    }, 4000, { leading: true, trailing: true })
}

export async function saveEvents(eventStore, rfcId) {
    const serializedEvents = eventStore.serializeEvents(rfcId);
    return fetch(`/cli-api/events`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: serializedEvents
    });
}

const LocalRfcStore = withSnackbar(withInitialRfcCommandsContext(LocalRfcStoreWithoutContext))

class LocalDiffRfcStoreWithoutContext extends RfcStoreWithoutContext {
    handleCommands = (...commands) => {
        super.handleCommands(...commands)
    }
}
const LocalDiffRfcStore = withInitialRfcCommandsContext(LocalDiffRfcStoreWithoutContext)

export {
    RfcStore,
    LocalRfcStore,
    LocalDiffRfcStore,
    RfcContext,
    withRfcContext
};


function commandNameFor(command) {
    const name = command.$classData.name
    const split = name.split('$')
    return split[1]
}
