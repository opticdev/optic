import React from 'react';

import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core';

import PathComponent from './PathComponent.js';
import keydown, { Keys } from 'react-keydown';

const { BACKSPACE, DELETE, ENTER } = Keys;

/*
This component should
- allow defining a path made up of components which are either basic components or parameterized
- on submit, something should resolve that path against existing paths in projections (caveat: path parameters with different names can cause issues)
- identify which path components need to be added via commands

 */
function newComponent() {
    return {
        name: '',
        isParameter: false
    }
}

export function cleanupPathComponentName(name) {
    return name.replace(/[{}:]/gi, '')
}

export function pathStringToPathComponents(pathString) {
    const components = pathString.split('/')
        .map(name => {
            const isParameter = name.charAt(0) === ':' || name.charAt(0) === '{'
            return { name, isParameter }
        })
    const [root, ...rest] = components;
    if (root.name === '') {
        return rest
    }
    return components;
}

class PathInput extends React.Component {
    constructor(props) {
        super(props)

        this.state = this.processValue({ pathComponents: [], currentComponent: '' }, this.props.initialPathString)
        this.handleBackspaceOrEnter = this.handleBackspaceOrEnter.bind(this)
    }

    componentDidMount() {
        this.emitChange(this.state)
    }

    processValue = (state, value) => {
        const components = pathStringToPathComponents(value)
        const currentComponent = components.length === 0 ? newComponent() : components.pop()

        return {
            pathComponents: [...state.pathComponents, ...components].filter(x => !!x.name),
            currentComponent
        }
    }

    handleChange = (e) => {
        const value = e.target.value
        const newState = this.processValue(this.state, value)
        this.setState(newState)
        this.emitChange(newState)
    }

    emitChange = (state) => {
        const { pathComponents, currentComponent } = state;
        const components = currentComponent.name ? [...pathComponents, currentComponent] : pathComponents

        this.props.onChange(components)
    }


    toggleIsParameter = (i) => () => {
        const { pathComponents } = this.state;
        this.setState({
            pathComponents: pathComponents.map((x, index) => {
                if (index === i) {
                    return {
                        ...x,
                        isParameter: !x.isParameter
                    }
                }
                return x
            })
        })
    }

    @keydown(BACKSPACE, DELETE, ENTER)
    handleBackspaceOrEnter(e) {
        if (e.which === ENTER) {
            this.props.onSubmit()
            return
        }
        console.log('backspace')
        const { currentComponent, pathComponents } = this.state;
        if (currentComponent.name === '') {
            this.setState({
                pathComponents: pathComponents.slice(0, -1)
            })
        }
    }

    render() {
        const { pathComponents, currentComponent } = this.state;
        return (
            <div>
                <div style={{ display: 'flex' }}>
                    <Typography variant="h5">/</Typography>
                    {pathComponents.map((x, i) => {
                        return (<PathComponent key={i} value={x} onClick={this.toggleIsParameter(i)} />);
                    })}
                    <TextField
                        multiline={false}
                        onKeyDown={this.handleBackspaceOrEnter}
                        onChange={this.handleChange}
                        value={currentComponent.name}
                        autoFocus
                    />
                </div>
            </div>
        );
    }
}

export default PathInput;