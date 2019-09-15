import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {EditorModes} from '../../contexts/EditorContext';
import TextField from '@material-ui/core/TextField';
import {primary} from '../../theme';

const styles = theme => ({
    heading: {
        fontSize: 48,
        color: primary,
        fontFamily: 'Ubuntu',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    inline: {
        fontSize: 16,
        fontWeight: 200,
        fontFamily: 'Ubuntu'
    },
    multi: {
        fontSize: 16,
        fontWeight: 200,
        fontFamily: 'Ubuntu'
    },
    pre: {
        fontFamily: 'Ubuntu',
        fontWeight: 200,
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap'

    }
});

class ContributionTextField extends React.Component {

    state = {
        value: this.props.value || ''
    }

    onChange = (e) => {
        this.setState({value: e.target.value})
    }

    render() {

        const {mode, defaultText, classes, variant = 'heading', inputStyle = {}, textStyle = {}, placeholder, onClick, onBlur} = this.props;
        const {value} = this.state

        const classToApply = classes[variant]
        const inputColor = variant === 'heading' ? 'primary' : 'default'

        return (
            <div onClick={onClick}>
                {(() => {
                    if (mode === EditorModes.DOCUMENTATION) {
                        const valueOrDefault = value || defaultText
                        return (
                            <div
                                className={classToApply}
                                color={inputColor}
                                style={textStyle}>{(variant === 'multi') ?
                                <pre className={classes.pre}>{valueOrDefault}</pre> : valueOrDefault}
                            </div>
                        );
                    } else if (mode === EditorModes.DESIGN) {
                        return (
                            <TextField
                                value={value}
                                onBlur={() => {
                                    if (onBlur && this.state.value !== this.props.value) {
                                        onBlur(this.state.value)
                                    }
                                }}
                                fullWidth={variant !== 'headline'}
                                onChange={this.onChange}
                                multiline={variant === 'multi'}
                                placeholder={(variant === 'heading') ? placeholder : undefined}
                                inputProps={{
                                    className: classToApply,
                                    style: {...inputStyle}
                                }}
                                margin="dense"
                                label={(variant !== 'heading') ? placeholder : null}
                                variant="outlined"
                            />
                        );
                    }
                })()}
            </div>
        )
    }
}

export default withStyles(styles)(ContributionTextField);
