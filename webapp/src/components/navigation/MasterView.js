import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import TopBar from './TopBar';
import Paper from '@material-ui/core/Paper';
import keydown from 'react-keydown'

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
		minWidth: 800,
		[theme.breakpoints.down('md')]: {
			marginLeft: 22,
			maxWidth: 900
		},
	}
});

const Sheet = withStyles(styles)(({classes, style}) => {
	return <Paper className={classes.sheet} style={style}>Hello</Paper>
})

const Margin = withStyles(styles)(({classes, children, className}) => {
	return <div className={className || classes.margin}>{children}</div>
})

class MasterView extends React.Component {

	@keydown('ctrl+f', 'cmd+f' )
	searchShortcut() {
		debugger
	}

	render() {

		const {classes} = this.props

		return (
			<div className={classes.pageContainer}>
				<div className={classes.navWrapper}><TopBar /></div>
				<div className={classes.contentWrapper}>
					<Margin className={classes.leftMargin} />
					<Sheet />
					<Margin />
				</div>
			</div>)
	}
}

export default withStyles(styles)(MasterView)
