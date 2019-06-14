import React from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {TextField} from '@material-ui/core';

import PathComponent from './PathComponent.js';
/*
This component should
- allow defining a path made up of components which are either basic components or parameterized
- on submit, something should resolve that path against existing paths in projections (caveat: path parameters with different names can cause issues)
- identify which path components need to be added via commandsf

 */
class PathInput extends React.Component {
    state = {
        pathComponents: [],
        currentComponent: ''
    }

    handleChange = (e) => {
        const value = e.target.value
        const regex = /[^a-zA-Z0-9/]/gi
        const components = value.split('/')
        const currentComponent = components.length === 0 ? '' : components.pop()
        console.log({components, currentComponent})
        this.setState({
            pathComponents: [...this.state.pathComponents, ...components],
            currentComponent
        })
    }

    render() {
        const {pathComponents, currentComponent} = this.state;
        return (
            <form>
                <Typography variant="body1">What is the request path?</Typography>
                <div style={{display: 'flex'}}>
                    {pathComponents.map((x, i) => <PathComponent key={i} value={x}/>)}
                    <TextField multiline={false} onChange={this.handleChange} value={currentComponent} autoFocus/>
                </div>
                <Button>continue</Button>
            </form>
        );
    }
}

export default PathInput;