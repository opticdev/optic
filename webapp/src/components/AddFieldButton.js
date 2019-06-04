import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import IconButton from '@material-ui/core/IconButton';
import ExpandMore from '@material-ui/icons/KeyboardArrowRight'
import ExpandLess from '@material-ui/icons/ExpandMore'
import ButtonBase from '@material-ui/core/ButtonBase';
import {SchemaEditorContext} from '../contexts/SchemaEditorContext';
import {Commands, DataTypesHelper} from '../engine/index'
import {SchemaEditorModes} from './Constants';

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
			if (mode !== SchemaEditorModes.EDIT) {
				return null
			}
			return <ButtonBase
				className={classes.addButton}
				disableRipple={true}
				onClick={() => {
					operations.toggleCollapsed(parentId, true)()
					operations.runCommand(Commands.AddField(parentId, DataTypesHelper.newId(), conceptId))
				}}
			> + Add Field</ButtonBase>
		}}
	</SchemaEditorContext.Consumer>
}

export default withStyles(styles)(AddFieldButton)
