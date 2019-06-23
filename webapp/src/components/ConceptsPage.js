import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {withRfcContext} from '../contexts/RfcContext';
import Typography from '@material-ui/core/Typography';
import SchemaEditor from './shape-editor/SchemaEditor';
import {EditorModes, withEditorContext} from '../contexts/EditorContext';
import ContributionTextField from './contributions/ContributionTextField';
import Divider from '@material-ui/core/Divider';
import {updateContribution} from '../engine/routines';
import {Redirect} from 'react-router-dom';
import {unwrap} from './shape-editor/Helpers';
import Editor from './navigation/Editor';

const styles = theme => ({
	root: {
		paddingLeft: 12,
		paddingRight: 12,
		paddingTop: 15
	},
	schemaEditorContainer: {
		marginTop: 5,
		// backgroundColor: '#fafafa'
	}
});

class ConceptsPage extends React.Component {
	render() {
		const {classes, conceptId, handleCommand, basePath, modeOverride, cachedQueryResults, queries} = this.props;
		let mode = modeOverride || this.props.mode;
		const {contributions} = cachedQueryResults;


		const {allowedReferences, concept} = queries.conceptById(conceptId);
		const currentShape = concept;

		if (!currentShape) {
			return <Redirect to={basePath}/>;
		}

		return (
			<Editor>
				<div className={classes.root}>
					{/*@Aidan what's the plan here?*/}
					<ContributionTextField
						value={currentShape.namedConcept.name}
						variant={'heading'}
						placeholder={'Concept Name'}
						mode={mode}
						onBlur={() => {
						}}
					/>

					<ContributionTextField
						value={contributions.getOrUndefined(conceptId, 'description')}
						variant={'multi'}
						placeholder={'Description'}
						mode={mode}
						onBlur={(value) => {
							handleCommand(updateContribution(conceptId, 'description', value));
						}}
					/>



					<div className={classes.schemaEditorContainer}>
						<SchemaEditor
							conceptId={conceptId}
							currentShape={currentShape}
							allowedReferences={allowedReferences}
							mode={mode}
							handleCommand={handleCommand}
						/>
					</div>

					{/*<Divider style={{marginTop: 15, marginBottom: 15}} />*/}

					{/*<Typography variant="h6" color="primary">Usages</Typography>*/}

				</div>
			</Editor>
		);
	}
}

export default withEditorContext(withRfcContext(withStyles(styles)(ConceptsPage)));
