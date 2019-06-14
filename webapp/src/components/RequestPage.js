import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
	root: {

	},
});

class RequestPage extends React.Component {
	render() {
		return <div>Request page for id {this.props.requestId}</div>
	}
}

export default withStyles(styles)(RequestPage)
