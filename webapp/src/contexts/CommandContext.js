import React from 'react';
import { GenericContextFactory } from './GenericContextFactory';
import uuidv4 from 'uuid/v4';

const clientSessionId = uuidv4()
const clientId = 'anonymous'

const {
    Context: CommandContext,
    withContext: withCommandContext
} = GenericContextFactory({ clientSessionId, clientId })


class CommandContextStore extends React.Component {
    render() {
        const {
            clientSessionId,
            clientId
        } = this.props;

        const context = {
            clientSessionId,
            clientId
        };

        return (
            <CommandContext.Provider value={context}>
                {this.props.children}
            </CommandContext.Provider>
        )
    }
}

export {
    CommandContext,
    withCommandContext,
    CommandContextStore
}