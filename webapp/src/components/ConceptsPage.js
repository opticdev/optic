import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import {withRfcContext} from '../contexts/RfcContext';

const styles = theme => ({
	root: {

	},
});

class ConceptsPage extends React.Component {
	render() {
		const {queries, rfcId} = this.props;
		const conceptShape = queries.conceptsById(this.props.conceptId);

		debugger

		return <div>Concept page for id {this.props.conceptId}</div>
	}
}

export default withRfcContext(withStyles(styles)(ConceptsPage))
