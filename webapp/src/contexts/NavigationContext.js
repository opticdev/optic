import React from 'react'
import { GenericContextFactory } from './GenericContextFactory';

const {
    Context: NavigationContext,
    withContext: withNavigationContext
} = GenericContextFactory({})

class NavigationStore extends React.Component {
    render() {
        const { baseUrl } = this.props;
        const context = {
            baseUrl
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
