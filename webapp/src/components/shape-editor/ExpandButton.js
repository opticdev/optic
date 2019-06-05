import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import IconButton from '@material-ui/core/IconButton/index';
import ExpandMore from '@material-ui/icons/KeyboardArrowRight'
import ExpandLess from '@material-ui/icons/ExpandMore'
import ButtonBase from '@material-ui/core/ButtonBase/index';
import {SchemaEditorContext} from '../../contexts/SchemaEditorContext';
import {Commands} from '../../engine'

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

			return <ButtonBase
				className={classes.expandButton}
				disableRipple={true}
				onClick={operations.toggleCollapsed(parentId)}
			>
			{isCollapsed ? <ExpandMore style={{width: 15}}/> : <ExpandLess style={{width: 15}}/> }
			</ButtonBase>
		}}
	</SchemaEditorContext.Consumer>
}

export default withStyles(styles)(ExpandButton)
