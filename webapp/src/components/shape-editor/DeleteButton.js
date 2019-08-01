import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Cancel from '@material-ui/icons/Cancel';
import {SchemaEditorContext} from '../../contexts/SchemaEditorContext';
import {ShapesCommands} from '../../engine'
import BasicButton from './BasicButton';
import {EditorModes} from '../../contexts/EditorContext';

const styles = theme => ({

});

function DeleteButton({classes, id, deleteType}) {

	return <SchemaEditorContext.Consumer>
		{({editorState, operations, conceptId, mode}) => {

			if (mode !== EditorModes.DESIGN) {
				return null
			}

			return <BasicButton
			    onClick={() => {
			    	if (deleteType === 'field') {
						operations.runCommand(ShapesCommands.RemoveField(id, conceptId))
					} else if (deleteType === 'type-parameter') {
						operations.runCommand(ShapesCommands.RemoveTypeParameter(id, conceptId))
					}
				}}>
				<Cancel style={{width: 15, color: '#a6a6a6'}} />
			</BasicButton>
		}}
	</SchemaEditorContext.Consumer>
}

export default withStyles(styles)(DeleteButton)
