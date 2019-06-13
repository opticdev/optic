import * as React from 'react';
import {newRfcService} from '../engine';
import {GenericContextFactory} from './GenericContextFactory.js';

const {
    Context: RfcContext,
    withContext: withRfcContext
} = GenericContextFactory(null)

class RfcStore extends React.Component {
    state = {
        rfcService: newRfcService()
    }

    handleCommand = (command) => {
        debugger;
        this.state.rfcService.handleCommand('abc', command)
        this.forceUpdate()
    }

    render() {
        const {rfcService} = this.state;
        const value = {...rfcService, handleCommand: this.handleCommand}
        return (
            <RfcContext.Provider value={value}>
                {this.props.children}
            </RfcContext.Provider>
        )
    }
}

export {
    RfcStore,
    RfcContext,
    withRfcContext
}