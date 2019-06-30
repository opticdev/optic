import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import classNames from 'classnames'
import {Keys} from 'react-keydown';

const {ENTER} = Keys

const styles = theme => ({
	root: {
		border: 0,
		background: 'transparent',
		padding: 0,
		margin: 0,
		fontFamily: 'Ubuntu',
		fontSize: 13,
		outline: 'none',
		cursor: 'pointer',
		'&:disabled': {
			cursor: 'inherit'
		}
	},
});

class BasicButton extends React.Component {
	render() {
		const {classes, children, color, style, className, onClick, disabled} = this.props

		return <button
			onClick={(e) => {
				if (!disabled && onClick) {
					onClick(e)
				}
			}}
			onKeyPress={(e) => {
				if (!disabled && e.keyCode === ENTER) {
					onClick(e)
				}
			}}
			disabled={disabled}
			className={classNames(classes.root, className)}
			style={{color: color, ...style}}
		>{children}</button>;
	}
}

export default withStyles(styles)(BasicButton);
