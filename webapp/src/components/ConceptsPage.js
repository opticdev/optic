import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import {withRfcContext} from '../contexts/RfcContext';
import Typography from '@material-ui/core/Typography';
import SchemaEditor from './shape-editor/SchemaEditor';
import {withEditorContext} from '../contexts/EditorContext';

const styles = theme => ({
	root: {
		paddingLeft: 12,
		paddingRight: 12,
		paddingTop: 15
	},
	schemaEditorContainer: {
		marginTop: 15,
		// backgroundColor: '#fafafa'
	}
});

class ConceptsPage extends React.Component {
	render() {
		const {queries, rfcId, classes, conceptId, mode, handleCommand} = this.props;
		const currentShape = queries.conceptsById(conceptId);

		return <div className={classes.root}>
			<Typography variant="h3" color="primary">{currentShape.namedConcept.name}</Typography>

			<div className={classes.schemaEditorContainer}>
				<SchemaEditor conceptId={conceptId}
							  currentShape={currentShape} mode={mode}
							  handleCommand={handleCommand}
				/>
			</div>
		</div>
	}
}

export default withEditorContext(withRfcContext(withStyles(styles)(ConceptsPage)))
