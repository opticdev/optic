import * as React from 'react';
import {GenericContextFactory} from './GenericContextFactory.js';

const {
    Context: InitialRfcCommandsContext,
    withContext: withInitialRfcCommandsContext
} = GenericContextFactory(null)

class InitialRfcCommandsStore extends React.Component {

    render() {
        const {rfcId, initialCommandsString, initialEventsString} = this.props

        return (
            <InitialRfcCommandsContext.Provider value={{rfcId, initialCommandsString, initialEventsString}}>
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
