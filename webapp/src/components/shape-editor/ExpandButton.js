import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import IconButton from '@material-ui/core/IconButton/index';
import ExpandMore from '@material-ui/icons/KeyboardArrowRight'
import ExpandLess from '@material-ui/icons/ExpandMore'
import {SchemaEditorContext} from '../../contexts/SchemaEditorContext';
import {ShapeCommands} from '../../engine'
import BasicButton from './BasicButton';

const styles = theme => ({
	expandButton: {
		position: 'absolute',
		left: 4,
	},
});

function ExpandButton({classes, parentId}) {

	return <SchemaEditorContext.Consumer>
		{({editorState, operations, schemaId}) => {

			const isCollapsed = editorState.collapsed.includes(parentId)

			return <BasicButton
				className={classes.expandButton}
				onClick={operations.toggleCollapsed(parentId)}
			>
			{isCollapsed ? <ExpandMore style={{width: 15}}/> : <ExpandLess style={{width: 15}}/> }
			</BasicButton>
		}}
	</SchemaEditorContext.Consumer>
}

export default withStyles(styles)(ExpandButton)
