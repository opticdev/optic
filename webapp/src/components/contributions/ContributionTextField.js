import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {EditorModes} from '../../contexts/EditorContext';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import {primary} from '../../theme';

const styles = theme => ({
	heading: {
		fontSize: 48,
		color: primary,
		fontFamily: 'Ubuntu'
	},
	inline: {
		fontSize: 16,
		fontWeight: 400,
		fontFamily: 'Ubuntu'
	},
	multi: {
		fontSize: 16,
		fontWeight: 400,
		fontFamily: 'Ubuntu'
	},
	pre: {
		fontFamily: 'Ubuntu',
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

		const {mode, classes, variant = 'heading', inputStyle = {}, textStyle = {}, placeholder, onBlur} = this.props;
		const {value} = this.state

		const classToApply = classes[variant]

		const inputColor = variant === 'heading' ? 'primary' : 'default'

		return <div style={{marginBottom: 12}}>
			{(() => {
				if (mode === EditorModes.DOCUMENTATION) {
					return <div className={classToApply}
									   color={inputColor}
									   style={textStyle}>{(variant === 'multi') ? <pre className={classes.pre}>{value}</pre> : value}</div>;
				} else if (mode === EditorModes.DESIGN) {
					return <TextField
						value={value}
						onBlur={() => {
							if (onBlur) {
								onBlur(this.state.value)
							}
						}}
						fullWidth={variant !== 'headline'}
						onChange={this.onChange}
						multiline={variant === 'multi'}
						placeholder={placeholder}
						inputProps={{
							className: classToApply,
							style: {...inputStyle}
						}}
						margin="dense"
						variant="outlined"
					/>;
				}
			})()}
		</div>

	}
}

export default withStyles(styles)(ContributionTextField);
