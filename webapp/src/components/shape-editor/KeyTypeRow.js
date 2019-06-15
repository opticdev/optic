import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import TextField from '@material-ui/core/TextField/index';
import InputBase from '@material-ui/core/InputBase/index';
import AutosizeInput from 'react-input-autosize';
import TypeName from './TypeName';
import {SchemaEditorContext} from '../../contexts/SchemaEditorContext';
import {Commands} from '../../engine'
import classNames from 'classnames'
import {EditorModes} from '../../contexts/EditorContext';

const styles = theme => ({
	root: {
		display: 'flex',
		flexDirection: 'row'
	},
	fieldNameInput: {
		...theme.typography.caption,
		fontSize: 12,
		padding: 2,
		fontWeight: 400,
		backgroundColor: 'transparent',
		border: 'none',
		outline: 'none',
		boxShadow: 'none',
		'&:hover': {
			borderBottom: '1px solid black',
		},
		'&:focus': {
			// backgroundColor: '#e5e5e5',
			borderBottom: '1px solid black',
		}
	},
	disabled: {
		borderBottom: 'none !important',
		pointerEvents: 'none',
		userSelect: 'none'
	},
	colon: {
		fontWeight: 800,
		paddingLeft: 0,
		paddingRight: 5,
		marginTop: 1
	},
	typeChangeButton: {
		fontSize: 13,
		marginTop: -2
	}
});

class KeyTypeRow extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			fieldName: this.props.initialKey || ''
		}
	}

	componentWillReceiveProps(nextProps, nextContext) {
		if (this.props.id !== nextProps.id) {
			this.setState({fieldName: nextProps.initialKey || ''})
		}
	}

	render() {

		const {classes, id, node} = this.props

		return <SchemaEditorContext.Consumer>
			{({editorState, operations, conceptId, mode}) => {
				return <div className={classes.root} key={id}>
					<AutosizeInput
						placeholder="field"
						inputClassName={classNames(classes.fieldNameInput, {[classes.disabled]: mode !== EditorModes.DESIGN})}
						value={this.state.fieldName}
						onChange={(event) => {
							this.setState({fieldName: event.target.value})
						}}
						spellCheck="false"
						onBlur={(e) => {
							operations.runCommand(Commands.SetFieldName(id, e.target.value, conceptId))
						}}
					/>
					<div className={classes.colon}>:</div>
					<TypeName node={node} id={id}/>
				</div>
			}}
		</SchemaEditorContext.Consumer>
	}
}

export default withStyles(styles)(KeyTypeRow)
