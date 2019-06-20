import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import {fade} from '@material-ui/core/styles';
import {NavTextColor, SearchBackground} from './constants';
import {Button} from '@material-ui/core';
import Badge from '@material-ui/core/Badge';
import KeyboardDown from '@material-ui/icons/KeyboardArrowDown';
// import keydown from 'react-keydown';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {primary} from '../../theme';
import Divider from '@material-ui/core/Divider';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';
import {withRfcContext} from '../../contexts/RfcContext';
import TextField from '@material-ui/core/TextField';
import {renameAPI} from '../../engine/routines';

const styles = theme => ({
	root: {
		flexGrow: 1,
	},
	appBar: {
		borderBottom: '1px solid #e2e2e2'
	},
	menuButton: {
		left: 8,
		color: NavTextColor,
	},
	title: {
		display: 'none',
		color: NavTextColor,
		[theme.breakpoints.up('sm')]: {
			display: 'block',
		},
	},
	spacer: {
		flexGrow: 1,
	},
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
		color: NavTextColor,
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
	toggleButton: {
		height: 28,
		// borderColor: primary,
		color: primary
	},
	toggleButtonSelected: {
		backgroundColor: `${primary} !important`,
		color: `white !important`
	},
	titleInput: {
		width: 280,
		color: NavTextColor
	}
});

const APITitle = ({mode, apiName, classes, onRenamed}) => {

	const [stagedName, setStagedName] = useState(apiName)

	return (
		<>
		{mode === EditorModes.DOCUMENTATION ? (
			<Typography className={classes.title} variant="h6" noWrap>
				{apiName}
			</Typography>
		): (
			<TextField value={stagedName}
					   onBlur={() => onRenamed(stagedName)}
					   className={classes.titleInput}
					   onChange={(e) => setStagedName(e.target.value)}
			/>
		)}
		</>
	)
}

class TopBar extends React.Component {


	render() {
		const {classes, mode, switchEditorMode, apiName, handleCommand, hasUnsavedChanges} = this.props;

		return (
			<div className={classes.root}>
				<AppBar position="static" style={{backgroundColor: 'white'}} elevation={0} className={classes.appBar}>
					<Toolbar variant="dense">

						<APITitle mode={mode}
								  apiName={apiName}
								  classes={classes}
								  onRenamed={(name) => handleCommand(renameAPI(name))}/>

						<IconButton
							edge="start"
							className={classes.menuButton}
							color="inherit"
							onClick={this.props.toggleSuperMenu}
							size="small"
						>
							<KeyboardDown/>
						</IconButton>

						{(hasUnsavedChanges && process.env.REACT_APP_CLI_MODE) ? (
							<Typography variant="caption" style={{color: '#8e8e8e', marginLeft: 20}}>
								Saving...
							</Typography>
						): null}

						<div className={classes.spacer}/>

						<ToggleButtonGroup value={mode}
										   exclusive size="small"
										   style={{marginRight: 22}}
										   onChange={(e, value) => switchEditorMode(value)}>
							<ToggleButton value={EditorModes.DOCUMENTATION} className={classes.toggleButton}
										  classes={{selected: classes.toggleButtonSelected}}>
								Documentation
							</ToggleButton>
							<ToggleButton value={EditorModes.DESIGN} className={classes.toggleButton}
										  classes={{selected: classes.toggleButtonSelected}}>
								Design
							</ToggleButton>
						</ToggleButtonGroup>

						<Button color="primary">
							Help
						</Button>
						{!process.env.REACT_APP_CLI_MODE ? (
							<Button color="secondary" onClick={this.props.showShare}>
								Share
							</Button>
						) : null}
						{/*<div className={classes.search}>*/}
						{/*	<div className={classes.searchIcon}>*/}
						{/*		<SearchIcon />*/}
						{/*	</div>*/}
						{/*	<InputBase*/}
						{/*		placeholder="Search…"*/}
						{/*		classes={{*/}
						{/*			root: classes.inputRoot,*/}
						{/*			input: classes.inputInput,*/}
						{/*		}}*/}
						{/*		inputProps={{ 'aria-label': 'Search' }}*/}
						{/*	/>*/}
						{/*</div>*/}
					</Toolbar>
				</AppBar>
			</div>
		);
	}
}


export default withRfcContext(withEditorContext(withStyles(styles)(TopBar)));
