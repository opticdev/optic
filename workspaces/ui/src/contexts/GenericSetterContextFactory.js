import React from 'react';

export function GenericSetterContextFactory(defaultValue) {

    const Context = React.createContext()
    class Store extends React.Component {
        state = {
            value: defaultValue
        }

        setValue = (value) => {
            this.setState({ value });
        }

        render() {
            const context = {
                value: this.state.value,
                setValue: this.setValue,
            };
            return (
                <Context.Provider value={context}>
                    {this.props.children}
                </Context.Provider>
            )
        }
    }

    return {
        Store,
        Context
    }
}