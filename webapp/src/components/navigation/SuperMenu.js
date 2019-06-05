import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu'
import SearchIcon from '@material-ui/icons/Search'
import InputBase from '@material-ui/core/InputBase';
import {fade} from '@material-ui/core/styles';
import {NavTextColor, SearchBackground} from './constants';
import {Button} from '@material-ui/core';
import Badge from '@material-ui/core/Badge';
import KeyboardDown from '@material-ui/icons/KeyboardArrowDown'
import Menu from '@material-ui/core/Menu';
// import keydown from 'react-keydown';

const styles = theme => ({
	search: {
		position: 'relative',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(SearchBackground, 0.15),
		'&:hover': {
			backgroundColor: fade(SearchBackground, 0.25),
		},
		marginLeft: 0,
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			marginLeft: theme.spacing(1),
			width: 'auto',
		},
	},
	searchIcon: {
		width: theme.spacing(7),
		color: NavTextColor,
		height: '100%',
		position: 'absolute',
		pointerEvents: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	inputRoot: {
		color: 'NavTextColor',
	},
	inputInput: {
		padding: theme.spacing(1, 1, 1, 7),
		transition: theme.transitions.create('width'),
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			width: 120,
			'&:focus': {
				width: 200,
			},
		},
	},
});

class SupeprMenu extends React.Component {

	render() {
		const {classes} = this.props
		return (
			<div className={classes.root}>
				<Menu>

				</Menu>
			</div>
		)
	}
}

export default withStyles(styles)(SupeprMenu)
