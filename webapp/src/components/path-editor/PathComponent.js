import {Typography} from '@material-ui/core';
import React from 'react';

class PathComponent extends React.Component {
    render() {
        return (
            <div style={{display: 'flex'}}>
                <Typography variant="h5">{this.props.value}</Typography>
                <Typography variant="h5">/</Typography>
            </div>
        );
    }
}

export default PathComponent;