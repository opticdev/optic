import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Menu from '@material-ui/core/Menu';
import DialogContent from '@material-ui/core/DialogContent';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import List from '@material-ui/core/List';
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import {Button} from '@material-ui/core';
import ButtonBase from '@material-ui/core/ButtonBase';
import {primary} from '../../theme';
import sortBy from 'lodash.sortby'

const styles = theme => ({
	root: {
		width: '90%',
		height: '90%'
	},
	gridItem: {
		padding: 15
	},
	pathButton: {
		padding: 5,
		fontSize: 15,
		fontWeight: 200,
		'&:hover': {
			color: primary,
			fontWeight: 400
		}
	},
	operations: {
		fontSize: 10,
		marginLeft: 15,
		marginTop: 4
	}
});

function createPath(url, name) {
	return {url, name}
}
const paths = [
	createPath('/user/:userId', 'User by Id'),
	createPath('/user/:userId/profile', 'User Profile'),
	createPath('/user/:userId/friends', 'Friends'),
	createPath('/user/:userId/friends/:friendId/history')
]

class SuperMenu extends React.Component {

	render() {
		const {classes} = this.props

		const sortedPaths = sortBy(paths, ['name', 'url'])

		return (
			<Popover
				classes={{paper: classes.root}}
				open={true}
				// open={this.props.open}
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

					<Grid container>

						<Grid xs={6} item className={classes.gridItem}>
							<Typography variant="h5" color="primary">Paths</Typography>
							<List>
								{sortedPaths.map(path => {
									return (
										<div>
											<ButtonBase disableRipple={true} className={classes.pathButton}>{path.url}</ButtonBase>
										</div>
									)
								})}
							</List>
						</Grid>
						<Grid xs={6} item>
						</Grid>



					</Grid>


				</div>
			</Popover>
		)
	}
}

export default withStyles(styles)(SuperMenu)
