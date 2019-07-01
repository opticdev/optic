import React from 'react'
import {makeStyles} from '@material-ui/core/styles';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    formControl: {
        margin: theme.spacing(3),
    },
}));

function HttpRequestMethodInput({selectedValues, choices, onChange}) {
    const classes = useStyles();
    const [state, setState] = React.useState(new Set(selectedValues));
    const handleChange = name => event => {
        const checked = event.target.checked
        const newState = new Set(state)
        if (checked) {
            newState.add(name)
        } else {
            newState.delete(name)
        }
        setState(newState);
        const selectedValues = [...newState]
        onChange(selectedValues)
    };
    return (
        <div className={classes.root}>
            <FormControl component="fieldset" className={classes.formControl}>
                <FormLabel component="legend">Available HTTP Methods</FormLabel>
                <FormGroup>
                    {choices.map(({name}) => {
                        return (
                            <FormControlLabel
                                key={name}
                                control={<Checkbox checked={state.has(name)} onChange={handleChange(name)} value={name}/>}
                                label={name}
                            />
                        )
                    })}
                </FormGroup>
            </FormControl>
        </div>
    )
}

export default HttpRequestMethodInput