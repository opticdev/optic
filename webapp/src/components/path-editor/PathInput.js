import React from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {TextField} from '@material-ui/core';

import PathComponent from './PathComponent.js';
import keydown, {Keys} from 'react-keydown';

const {BACKSPACE, DELETE} = Keys;

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

class PathInput extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            pathComponents: [],
            currentComponent: newComponent()
        }

        this.handleBackspace = this.handleBackspace.bind(this)
    }

    handleChange = (e) => {
        const value = e.target.value
        const components = value.split('/').map(name => {
            const isParameter = name.charAt(0) === ':' || name.charAt(0) === '{'
            return {name, isParameter}
        })
        const currentComponent = components.length === 0 ? newComponent() : components.pop()
        console.log({components, currentComponent})
        this.setState({
            pathComponents: [...this.state.pathComponents, ...components].filter(x => !!x.name),
            currentComponent
        })
        return false
    }

    handleSubmit = (e) => {
        e.preventDefault()
        const {pathComponents, currentComponent} = this.state;
        const components = currentComponent.name ? [...pathComponents, currentComponent] : pathComponents
        this.props.onSubmit({pathComponents: components})
        return false
    }

    toggleIsParameter = (i) => () => {
        const {pathComponents} = this.state;
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

    @keydown(BACKSPACE, DELETE)
    handleBackspace() {
        console.log('backspace')
        const {currentComponent, pathComponents} = this.state;
        if (currentComponent.name === '') {
            this.setState({
                pathComponents: pathComponents.slice(0, -1)
            })
        }
    }

    render() {
        const {pathComponents, currentComponent} = this.state;
        return (
            <div>
                <Typography variant="body1">What is the request path?</Typography>
                <div style={{display: 'flex'}}>
                    <Typography variant="h5">/</Typography>
                    {pathComponents.map((x, i) => {
                        return (<PathComponent key={i} value={x} onClick={this.toggleIsParameter(i)}/>);
                    })}
                    <TextField multiline={false} onKeyDown={this.handleBackspace} onChange={this.handleChange} value={currentComponent.name} autoFocus/>
                </div>
                <Button onClick={this.handleSubmit}>continue</Button>
            </div>
        );
    }
}

export default PathInput;