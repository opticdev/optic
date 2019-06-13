import * as React from 'react';

export function GenericContextFactory(defaultValue) {
    const Context = React.createContext(defaultValue);

    const withContext = function (Wrapper) {
        return function (props) {
            return (
                <Context.Consumer>
                    {(context) => {
                        return (
                            <Wrapper {...props} {...context} />
                        )
                    }}
                </Context.Consumer>
            )
        }
    }

    return {
        Context,
        withContext
    }
}