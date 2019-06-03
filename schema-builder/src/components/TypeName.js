import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import TextField from '@material-ui/core/TextField/index';
import InputBase from '@material-ui/core/InputBase/index';
import AutosizeInput from 'react-input-autosize';
import ButtonBase from '@material-ui/core/ButtonBase/index';
import {primitiveColors, generateTypeName} from './Types';
import LinkIcon from '@material-ui/icons/Link';
import {SchemaEditorContext} from '../contexts/SchemaEditorContext';

const styles = theme => ({
	root: {
		display: 'flex'
	},
	typeChangeButton: {
		fontSize: 13,
		marginTop: -2,
		'&:hover $linkIcon': {
			display: 'inherit'
		}
	},
	linkIcon: {
		width: 12,
		marginLeft: 2,
		marginTop: 2,
		display: 'none',
		cursor: 'pointer'
	},
	goTo: {
		marginLeft: 10,
		cursor: 'pointer',
		color: '#3682e3'
	}
});

class TypeName extends React.Component {

	constructor(props) {
		super(props);
	}

	componentWillReceiveProps(nextProps, nextContext) {
		if (this.props.id !== nextProps.id) {
			this.state = {
				fieldName: nextProps.initialKey || ''
			}
		}
	}

	render() {

		const {classes, node, inField, style, id} = this.props;
		const {type} = node

		if (inField && type.hasFields) {
			return null;
		}

		const color = (() => {

			if (type.isRef) {
				return '#8a558e'
			} else {
				return primitiveColors[type.id] || '#49525f'
			}

		})()

		return <SchemaEditorContext.Consumer>
			{({editorState, operations}) => {
				return <div className={classes.root} key={id}>
					<ButtonBase className={classes.typeChangeButton}
								disableRipple={true}
								onClick={operations.showTypeMenu(id, type)}
								style={{
									color,
									fontWeight: (type.hasFields || type.hasTypeParameters) ? 700 : 200,
									...style,
								}}>
						{generateTypeName(type, node, editorState.projection.allowedTypeReferences)}

						{type.isRef ? <div
							className={classes.goTo}
							onClick={(e) => {
								e.stopPropagation()

							}}
						>(view)</div> : null}
					</ButtonBase>
				</div>
			}}
		</SchemaEditorContext.Consumer>;
	}
}

export default withStyles(styles)(TypeName);
