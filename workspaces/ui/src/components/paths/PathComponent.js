import React from 'react';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import CodeIcon from '@material-ui/icons/Code';
import {cleanupPathComponentName} from '../diff/v2/AddUrlModal';

class PathComponent extends React.Component {
    render() {
        const {value, onClick} = this.props;
        const {name, isParameter} = value;
        const label = cleanupPathComponentName(name)
        return (
            <div style={{display: 'flex'}}>
                <Chip onClick={onClick} label={label}
                      icon={isParameter ? <CodeIcon/> : null}/>
                <Typography variant="h5">/</Typography>
            </div>
        );
    }
}

export default PathComponent;
