import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Cancel from '@material-ui/icons/Cancel';
import ButtonBase from '@material-ui/core/ButtonBase';
import {SchemaEditorContext} from '../contexts/SchemaEditorContext';
import {Commands} from '../engine/index'

const styles = theme => ({

});

function DeleteButton({classes, id, deleteType}) {

	return <SchemaEditorContext.Consumer>
		{({editorState, operations, conceptId}) => {
			return <ButtonBase
				disableRipple={true}
			    onClick={() => {
			    	if (deleteType === 'field') {
						operations.runCommand(Commands.RemoveField(id, conceptId))
					} else if (deleteType === 'type-parameter') {
						operations.runCommand(Commands.RemoveTypeParameter(id, conceptId))
					}
				}}>
				<Cancel style={{width: 15, color: '#a6a6a6'}} />
			</ButtonBase>
		}}
	</SchemaEditorContext.Consumer>
}

export default withStyles(styles)(DeleteButton)
