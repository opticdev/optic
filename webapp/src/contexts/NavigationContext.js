import React from 'react'
import { GenericContextFactory } from './GenericContextFactory';

const {
    Context: NavigationContext,
    withContext: withNavigationContext
} = GenericContextFactory({})

class NavigationStore extends React.Component{
    render() {
        const {onShapeSelected, addAdditionalCommands} = this.props;
        const context = {
            onShapeSelected,
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
