import * as React from 'react';
import {facade, queries, eventStore} from '../engine';
import {GenericContextFactory} from './GenericContextFactory.js';
import {withInitialRfcCommandsContext} from './InitialRfcCommandsContext.js';

const {
    Context: RfcContext,
    withContext: withRfcContext
} = GenericContextFactory(null)

class RfcStoreWithoutContext extends React.Component {
    state = {
        rfcService: facade.fromJsonCommands(eventStore, JSON.stringify(this.props.initialRfcCommands), this.props.rfcId),
        queries
    }

    handleCommand = (command) => {
        debugger;
        this.state.rfcService.handleCommand(this.props.rfcId, command)
        this.forceUpdate()
    }

    render() {
        const {queries} = this.state;
        const value = {queries, handleCommand: this.handleCommand}
        return (
            <RfcContext.Provider value={value}>
                {this.props.children}
            </RfcContext.Provider>
        )
    }
}

const RfcStore = withInitialRfcCommandsContext(RfcStoreWithoutContext)

export {
    RfcStore,
    RfcContext,
    withRfcContext
}