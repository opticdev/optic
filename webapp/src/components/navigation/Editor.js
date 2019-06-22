import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import TopBar from './TopBar';
import Paper from '@material-ui/core/Paper';
import keydown from 'react-keydown';
import SuperMenu from './SuperMenu';
import FloatingAddButton from './FloatingAddButton';
import {EditorStore} from '../../contexts/EditorContext';
import ShareDialog from './ShareDialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import {withFocusedRequestContext} from '../../contexts/FocusedRequestContext';
import {withRouter} from 'react-router-dom';

const styles = theme => ({
	pageContainer: {
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
		height: '100vh !important'
	},
	navWrapper: {
		height: 50
	},
	contentWrapper: {
		flex: 1,
		overflow: 'scroll',
		backgroundColor: '#fafafa',
		display: 'flex',
		justifyContent: 'center',
	},
	margin: {
		minWidth: 30,
		flex: 1,
	},
	leftMargin: {
		minWidth: 30,
		flex: 1,
		[theme.breakpoints.down('md')]: {
			display: 'none'
		},
	},
	sheet: {
		marginTop: 80,
		maxWidth: 1000,
		flex: 6.5,
		minHeight: 1200,
		height: 'fit-content',
		paddingBottom: 80,
		marginBottom: 80,
		width: 850,
		paddingLeft: 15,
		paddingRight: 15,
		[theme.breakpoints.down('md')]: {
			marginLeft: 22,
			maxWidth: 900
		},
	},
	toc: {
		marginTop: 120,
		position: 'fixed',
		float: 'right',
		padding: 20,
		paddingLeft: '2%'
	}
});

const Sheet = withStyles(styles)(({classes, style, children}) => {
	return <Paper className={classes.sheet} style={style} id="center-sheet">
		{children}
		{/*<FloatingAddButton />*/}
	</Paper>;
});

const Margin = withStyles(styles)(({classes, children, className}) => {
	return <div className={className || classes.margin}>{children}</div>;
});

const TOC = withStyles(styles)(({classes, children}) => {
	return <div className={classes.toc}>
		{children}
	</div>;
});


class Editor extends React.Component {

	state = {
		superMenuOpen: false,
		shareOpen: false
	};

	@keydown('ctrl+f', 'cmd+f')
	searchShortcut(e) {
		e.preventDefault();
		e.stopPropagation();
		this.toggleSuperMenu(null);
	}

	@keydown('escape')
	escape(e) {
		e.preventDefault();
		e.stopPropagation();
		this.closeAll();
	}

	closeAll = () => {
		this.toggleSuperMenu(null, true);
	};

	toggleSuperMenu = (e, forceClose) => {
		this.setState({superMenuOpen: (forceClose) ? false : !this.state.superMenuOpen});
	};

	showShare = () => {
		this.setState({shareOpen: true});
	};

	hideShare = () => {
		this.setState({shareOpen: false});
	};

	render() {

		const {classes} = this.props;

		return (
			<div className={classes.pageContainer}>
				<div className={classes.navWrapper}>
					<TopBar toggleSuperMenu={this.toggleSuperMenu} showShare={this.showShare}/>
				</div>
				<div className={classes.contentWrapper}>
					<Margin className={classes.leftMargin}>
						{this.props.leftMargin ? <TOC children={this.props.leftMargin}/>: null}
					</Margin>
					<Sheet>{this.props.children}</Sheet>
					<Margin/>
				</div>
				<SuperMenu open={this.state.superMenuOpen} toggle={this.toggleSuperMenu}/>
				<FloatingAddButton/>
				<ShareDialog close={this.hideShare} open={this.state.shareOpen}/>
			</div>
		);
	}
}

export default withStyles(styles)(Editor);
