import * as React from 'react';
import {Facade, Queries} from '../engine';
import {GenericContextFactory} from './GenericContextFactory.js';
import {withInitialRfcCommandsContext} from './InitialRfcCommandsContext.js';
import debounce from 'lodash.debounce';
import {withSnackbar} from 'notistack';

const {
    Context: RfcContext,
    withContext: withRfcContext
} = GenericContextFactory(null);

class RfcStoreWithoutContext extends React.Component {


    constructor(props) {
        super(props);

        const eventStore = Facade.makeEventStore();

        const queries = Queries(eventStore, this.props.rfcId);

        if (this.props.initialEventsString) {
            eventStore.bulkAdd(this.props.rfcId, this.props.initialEventsString)
        }

        this.state = {
            eventStore,
            rfcService: Facade.fromJsonCommands(eventStore, this.props.initialCommandsString || '[]', this.props.rfcId),
            queries,
            hasUnsavedChanges: false
        };
    }

    handleCommand = (command) => {
        console.log({command})
        this.state.rfcService.handleCommands(this.props.rfcId, command);
        this.forceUpdate();
        if (process.env.REACT_APP_CLI_MODE) {
            this.setState({hasUnsavedChanges: true})
            this.persistLocal()
        }
    };

    handleCommands = (commands) => {
        console.log({commands})
        this.state.rfcService.handleCommands(this.props.rfcId, ...commands);
        this.forceUpdate();
        if (process.env.REACT_APP_CLI_MODE) {
            this.setState({hasUnsavedChanges: true})
            this.persistLocal()
        }
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

        const value = {
            rfcId,
            queries,
            contributions,
            apiName,
            handleCommand: this.handleCommand,
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
