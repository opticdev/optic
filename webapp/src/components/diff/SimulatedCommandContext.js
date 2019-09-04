import React from 'react';
import { InitialRfcCommandsStore } from "../../contexts/InitialRfcCommandsContext";
import { LocalDiffRfcStore } from "../../contexts/RfcContext";
import { commandsToJson } from '../../engine';

class SimulatedCommandContext extends React.Component {
    render() {
        const { rfcId, eventStore, commands, shouldSimulate } = this.props;
        const initialEventsString = eventStore.serializeEvents(rfcId)
        const initialCommandsString = shouldSimulate ? JSON.stringify(commandsToJson(commands)) : null
        return (
            <InitialRfcCommandsStore
                rfcId={rfcId}
                initialEventsString={initialEventsString}
                initialCommandsString={initialCommandsString}>
                <LocalDiffRfcStore key={initialCommandsString}>
                    {this.props.children}
                </LocalDiffRfcStore>
            </InitialRfcCommandsStore>
        )
    }
}

export default SimulatedCommandContext