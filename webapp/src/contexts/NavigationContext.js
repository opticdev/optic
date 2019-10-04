import React from 'react'
import { GenericContextFactory } from './GenericContextFactory';

const {
    Context: NavigationContext,
    withContext: withNavigationContext
} = GenericContextFactory({})

class NavigationStore extends React.Component{
    render() {
        const {onShapeSelected, addAdditionalCommands, inDiffMode = false} = this.props;
        const context = {
            onShapeSelected,
            inDiffMode,
            addAdditionalCommands
        }
        return (
            <NavigationContext.Provider value={context}>
                {this.props.children}
            </NavigationContext.Provider>
        )
    }
}

export {
    NavigationContext,
    withNavigationContext,
    NavigationStore
}
