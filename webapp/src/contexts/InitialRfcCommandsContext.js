import * as React from 'react';
import {GenericContextFactory} from './GenericContextFactory.js';

const {
    Context: InitialRfcCommandsContext,
    withContext: withInitialRfcCommandsContext
} = GenericContextFactory(null)

class InitialRfcCommandsStore extends React.Component {
    state = {
        initialRfcCommands: [],
        rfcId: 'abc'
    }

    render() {
        return (
            <InitialRfcCommandsContext.Provider value={this.state}>
                {this.props.children}
            </InitialRfcCommandsContext.Provider>
        )
    }
}

export {
    InitialRfcCommandsStore,
    InitialRfcCommandsContext,
    withInitialRfcCommandsContext
}