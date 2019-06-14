import React from 'react';
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
import sortBy from 'lodash.sortby';
import {withRfcContext} from '../../contexts/RfcContext';
import {Link} from 'react-router-dom';

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
	},
	bareLink: {
		textDecoration: 'none',
		color: 'inherit',
		cursor: 'pointer'
	}
});

class SuperMenu extends React.Component {

render() {
	const {classes} = this.props;

	const {queries, rfcId, basePath} = this.props;
	const paths = queries.paths(rfcId);
	const sortedPaths = sortBy(paths, ['absolutePath']);


	return (
		<Popover
			classes={{paper: classes.root}}
			// open={true}
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
				<Grid container>
					<Grid xs={6} item className={classes.gridItem}>
						<Typography variant="h5" color="primary">Paths</Typography>
						<List>
							{sortedPaths.map(({pathId, absolutePath}) => {
								const to = `${basePath}/requests/${pathId}`
								return (
									<div>
										<Link to={to} className={classes.bareLink}>
										<ButtonBase disableRipple={true}
													onClick={() => this.props.toggle(null, true)}
													className={classes.pathButton}>{absolutePath}</ButtonBase>
										</Link>
									</div>
								);
							})}
						</List>
					</Grid>
					<Grid xs={6} item>
					</Grid>


				</Grid>


			</div>
		</Popover>
	);
	}
}

export default withRfcContext(withStyles(styles)(SuperMenu));
