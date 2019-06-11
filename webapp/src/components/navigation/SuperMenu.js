import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Menu from '@material-ui/core/Menu';
import DialogContent from '@material-ui/core/DialogContent';
import Popover from '@material-ui/core/Popover';

const styles = theme => ({
	root: {
		width: '90%',
		height: '90%'
	}
});

class SuperMenu extends React.Component {

	render() {
		const {classes} = this.props

		return (
			<Popover
				classes={{paper: classes.root}}
				open={this.props.open}
				onClose={() => this.props.toggle(null, true)}
				anchorOrigin={{
					vertical: 52,
					horizontal: 5,
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
			>
				<div>
					The content of the Popover.
				</div>
			</Popover>
		)
	}
}

export default withStyles(styles)(SuperMenu)
