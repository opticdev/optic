import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import TopBar from './TopBar';
import Paper from '@material-ui/core/Paper';
import keydown from 'react-keydown'
import SuperMenu from './SuperMenu';
import FloatingAddButton from './FloatingAddButton';

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
		height: 1000,
		marginBottom: 80,
		width: 850,
		[theme.breakpoints.down('md')]: {
			marginLeft: 22,
			maxWidth: 900
		},
	}
});

const Sheet = withStyles(styles)(({classes, style, children}) => {
	return <Paper className={classes.sheet} style={style} id="center-sheet">
		{children}
		{/*<FloatingAddButton />*/}
	</Paper>
})

const Margin = withStyles(styles)(({classes, children, className}) => {
	return <div className={className || classes.margin}>{children}</div>
})

class MasterView extends React.Component {

	state = {
		superMenuOpen: false
	}

	@keydown('ctrl+f', 'cmd+f' )
	searchShortcut(e) {
		e.preventDefault()
		e.stopPropagation()
	}

	@keydown('escape' )
	searchShortcut(e) {
		e.preventDefault()
		e.stopPropagation()
		this.closeAll()
	}

	closeAll = () => {
		this.toggleSuperMenu(null,true)
	}

	toggleSuperMenu = (e, forceClose) => {
		this.setState({superMenuOpen: (forceClose) ? false : !this.state.superMenuOpen})
	}

	render() {

		const {classes} = this.props

		return (
			<div className={classes.pageContainer}>
				<div className={classes.navWrapper}>
					<TopBar toggleSuperMenu={this.toggleSuperMenu} />
				</div>
				<div className={classes.contentWrapper}>
					<Margin className={classes.leftMargin} />
					<Sheet>{this.props.content}</Sheet>
					<Margin />
				</div>
				<SuperMenu open={this.state.superMenuOpen} toggle={this.toggleSuperMenu} />
			</div>)
	}
}

export default withStyles(styles)(MasterView)
