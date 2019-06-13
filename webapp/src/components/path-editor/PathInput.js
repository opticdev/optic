import React, {Component} from 'react';
import {TextField} from "@material-ui/core";

class PathInput extends Component {
    state = {
        pathComponents:[]
    }
    handleChange = (event) => {
        const value = e.target.value
    }
    render() {
        return (
            <div>
                <PathComponentList pathComponents={pathComponents} />
                <TextField multiline={false} onChange={this.handleChange} />
            </div>
        );
    }
}

export default PathInput;