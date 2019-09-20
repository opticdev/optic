import * as React from 'react';

export function GenericContextFactory(defaultValue) {
    const Context = React.createContext(defaultValue);

    //@TODO: add optional key parameter e.g. function (Wrapper, propKey = null). If it is set, instead of spreading the context it will use that key for the prop name
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