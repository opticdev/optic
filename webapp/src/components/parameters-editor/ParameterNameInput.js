import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Input from '@material-ui/core/Input';
import {EditorModes} from '../../contexts/EditorContext.js';

const styles = theme => ({
    input: {
        fontSize: 14,
        outline: 'none',
        boxShadow: 'none',
        borderBottom: '1px solid white',
        '&:hover': {
            borderBottom: '1px solid black',
        },
        '&:focus': {
            // backgroundColor: '#e5e5e5',
            borderBottom: '1px solid black',
        }
    },
});

class ParameterNameInput extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            name: this.props.defaultName
        }
    }

    render() {

        const {classes, mode} = this.props

        if (mode === EditorModes.DESIGN) {
            return (
                <Input
                    disableUnderline={true}
                    placeholder="Name"
                    inputProps={{
                        style: {
                            fontFamily: 'Ubuntu',
                            padding: 0,
                            paddingBottom: 3,
                            marginTop: 4,
                        }
                    }}
                    className={classes.input}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    value={this.state.name}
                />
            )
        } else {
            return <span style={{fontFamily: 'Ubuntu'}}>{this.state.name}</span>
        }

    }
}

export default withStyles(styles)(ParameterNameInput)
