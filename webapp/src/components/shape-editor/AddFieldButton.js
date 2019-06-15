import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import IconButton from '@material-ui/core/IconButton/index';
import ExpandMore from '@material-ui/icons/KeyboardArrowRight'
import ExpandLess from '@material-ui/icons/ExpandMore'
import {SchemaEditorContext} from '../../contexts/SchemaEditorContext';
import {ShapeCommands, DataTypesHelper} from '../../engine'
import BasicButton from './BasicButton';
import {EditorModes} from '../../contexts/EditorContext';

const styles = theme => ({
	addButton: {
		fontWeight: 500,
		marginLeft: 8,
		color: '#3682e3'
	},
});

function AddFieldButton({classes, parentId}) {

	return <SchemaEditorContext.Consumer>
		{({editorState, operations, conceptId, mode}) => {
			if (mode !== EditorModes.DESIGN) {
				return null
			}
			return <BasicButton
				className={classes.addButton}
				onClick={() => {
					operations.toggleCollapsed(parentId, true)()
					operations.runCommand(ShapeCommands.AddField(parentId, DataTypesHelper.newId(), conceptId))
				}}
			> + Add Field</BasicButton>
		}}
	</SchemaEditorContext.Consumer>
}

export default withStyles(styles)(AddFieldButton)
